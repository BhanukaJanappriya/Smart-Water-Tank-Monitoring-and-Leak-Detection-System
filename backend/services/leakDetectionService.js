import config from '../config.js';
import * as dbService from './dbService.js';

// In-memory cache for fast stream processing and leak detection
const readingsHistory = [];
const MAX_HISTORY_LIMIT = 1000; // Prevent memory leak

let activeAlerts = [];
let latestProcessedStatus = null;

// New state for flow and usage calculation
let dailyUsageLiters = 0;
let lastResetDate = new Date().toDateString();

/**
 * Calculates water tank metrics based on the distance reading.
 *
 * @param {number|null} distanceCm - Distance from sensor to water level in cm
 * @param {string} sensorStatus - Status message from ESP32
 * @returns {object} Processed metrics
 */
export function calculateMetrics(distanceCm, sensorStatus) {
  const { tankHeightCm, tankFullDistanceCm, tankEmptyDistanceCm, tankRadiusCm } = config;

  if (distanceCm === null || sensorStatus !== 'ok') {
    return {
      waterDepthCm: 0,
      percentage: 0,
      volumeLiters: 0,
      isValid: false,
      error: sensorStatus || 'No sensor reading available'
    };
  }

  // Calculate the max possible water depth based on calibration thresholds
  const maxWaterDepthCm = tankEmptyDistanceCm - tankFullDistanceCm;

  // Calculate actual water depth: empty distance minus current distance
  // Bounded between 0 and maxWaterDepthCm
  let waterDepthCm = tankEmptyDistanceCm - distanceCm;
  waterDepthCm = Math.max(0, Math.min(maxWaterDepthCm, waterDepthCm));

  // Calculate percentage full (0% to 100%)
  const percentage = maxWaterDepthCm > 0 ? (waterDepthCm / maxWaterDepthCm) * 100 : 0;
  const roundedPercentage = Math.round(percentage * 10) / 10; // Round to 1 decimal place

  // Calculate Volume in Liters: Pi * r^2 * depth / 1000
  const radiusM = tankRadiusCm / 100;
  const depthM = waterDepthCm / 100;
  const volumeM3 = Math.PI * Math.pow(radiusM, 2) * depthM;
  const volumeLiters = Math.round(volumeM3 * 1000 * 10) / 10; // Round to 1 decimal place

  return {
    waterDepthCm: Math.round(waterDepthCm * 10) / 10,
    percentage: roundedPercentage,
    volumeLiters: volumeLiters,
    isValid: true
  };
}

/**
 * Performs linear regression on historical readings to detect steady, continuous leaks.
 * Looks at the last N minutes of data to find a steady linear decrease.
 *
 * @returns {object|null} Leak evaluation details or null if not enough data
 */
function evaluateLeak() {
  const { pollIntervalMs, leakThresholdCmPerMin } = config;

  // We want to analyze data from the last 3 minutes
  const threeMinutesInMs = 3 * 60 * 1000;
  const minRequiredReadings = Math.max(6, Math.round(threeMinutesInMs / pollIntervalMs));

  // Get valid readings from the last 3 minutes
  const now = new Date();
  const recentReadings = readingsHistory
    .filter(r => r.isValid && (now - new Date(r.timestamp)) < threeMinutesInMs)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (recentReadings.length < minRequiredReadings) {
    return null; // Not enough data points yet
  }

  // Prepare data points for linear regression (x: time in seconds, y: water depth in cm)
  const startTime = new Date(recentReadings[0].timestamp).getTime() / 1000;
  const points = recentReadings.map(r => ({
    x: (new Date(r.timestamp).getTime() / 1000) - startTime,
    y: r.waterDepthCm
  }));

  const n = points.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
    sumYY += p.y * p.y;
  }

  const meanX = sumX / n;
  const meanY = sumY / n;

  // Covariance and Variances
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (const p of points) {
    const diffX = p.x - meanX;
    const diffY = p.y - meanY;
    num += diffX * diffY;
    denX += diffX * diffX;
    denY += diffY * diffY;
  }

  if (denX === 0 || denY === 0) {
    return null; // No variation
  }

  // Slope m (change in cm per second)
  const slopeCmPerSec = num / denX;
  const slopeCmPerMin = slopeCmPerSec * 60;

  // Correlation coefficient r (determines how linear/steady the change is)
  const correlationR = num / Math.sqrt(denX * denY);

  // A leak is characterized by:
  // 1. A steady decrease (high negative correlation, e.g., r < -0.85)
  // 2. The rate of drop exceeds the leak threshold (e.g. > 0.1 cm/min)
  // 3. The drop is not so massive that it represents normal major usage (e.g., let's limit it to a steady small-to-moderate rate)
  const isSteadyDecrease = correlationR < -0.85;
  const rateOfDrop = -slopeCmPerMin; // positive value represents rate of loss
  const isExceedingThreshold = rateOfDrop >= leakThresholdCmPerMin;

  const isLeakDetected = isSteadyDecrease && isExceedingThreshold;

  return {
    isLeakDetected,
    correlation: Math.round(correlationR * 100) / 100,
    slopeCmPerMin: Math.round(slopeCmPerMin * 1000) / 1000,
    rateOfDropCmPerMin: Math.round(rateOfDrop * 1000) / 1000,
    dataPointsCount: n
  };
}

/**
 * Process a new reading from the ESP32, update history, log to database, and check for alerts.
 *
 * @param {object} rawReading - Raw response object from ESP32 service
 * @returns {Promise<object>} The fully processed status object
 */
export async function addReading(rawReading) {
  const metrics = calculateMetrics(
    rawReading.success && rawReading.data ? rawReading.data.distance_cm : null,
    rawReading.success && rawReading.data ? rawReading.data.status : (rawReading.error || 'Connection Failed')  
  );

  // Calculate Flow Rate and Daily Usage
  let flowRate = 0;
  const now = new Date();
  const today = now.toDateString();

  // Reset daily usage at midnight
  if (today !== lastResetDate) {
    dailyUsageLiters = 0;
    lastResetDate = today;
  }

  if (metrics.isValid && readingsHistory.length > 0) {
    const lastReading = readingsHistory[readingsHistory.length - 1];
    if (lastReading.isValid) {
      const timeDiffMin = (new Date(rawReading.timestamp) - new Date(lastReading.timestamp)) / (1000 * 60);
      const volDiffLiters = lastReading.volumeLiters - metrics.volumeLiters;

      if (timeDiffMin > 0) {
        // flowRate in L/min. Positive means water is being used/leaving the tank.
        flowRate = Math.max(0, volDiffLiters / timeDiffMin);
        
        // If volume decreased, add to daily usage
        if (volDiffLiters > 0) {
          dailyUsageLiters += volDiffLiters;
        }
      }
    }
  }

  const processedReading = {
    timestamp: rawReading.timestamp,
    isValid: metrics.isValid,
    distanceCm: rawReading.success && rawReading.data ? rawReading.data.distance_cm : null,
    waterDepthCm: metrics.waterDepthCm,
    percentage: metrics.percentage,
    volumeLiters: metrics.volumeLiters,
    flowRate: Math.round(flowRate * 100) / 100,
    dailyUsage: Math.round(dailyUsageLiters * 10) / 10,
    temperature: rawReading.success && rawReading.data?.temperature_c !== undefined ? rawReading.data.temperature_c : 24.5,
    sensorStatus: rawReading.success && rawReading.data ? rawReading.data.status : 'offline',
    error: metrics.error || null
  };

  // Add to in-memory history cache
  readingsHistory.push(processedReading);
  if (readingsHistory.length > MAX_HISTORY_LIMIT) {
    readingsHistory.shift();
  }

  // Persist reading to SQLite database
  try {
    await dbService.saveReading(processedReading);
  } catch (err) {
    console.error('[Leak Detection] Error saving reading to SQLite:', err.message);
  }

  // Run leak evaluation
  const leakAnalysis = evaluateLeak();
  const isLeakAlertActive = leakAnalysis ? leakAnalysis.isLeakDetected : false;

  // Manage Alerts
  const newAlerts = [];

  // 1. Leak Alert
  if (isLeakAlertActive) {
    newAlerts.push({
      type: 'LEAK_DETECTED',
      severity: 'CRITICAL',
      message: `Potential water leak detected! Water level is dropping steadily at a rate of ${leakAnalysis.rateOfDropCmPerMin} cm/min.`,
      timestamp: rawReading.timestamp,
      details: leakAnalysis
    });
  }

  // 2. Critical Level Alerts
  if (metrics.isValid) {
    if (metrics.percentage <= 15) {
      newAlerts.push({
        type: 'CRITICAL_LOW_WATER',
        severity: 'HIGH',
        message: `Water level is critically low: ${metrics.percentage}% (${metrics.volumeLiters} Liters remaining).`,
        timestamp: rawReading.timestamp
      });
    } else if (metrics.percentage >= 95) {
      newAlerts.push({
        type: 'CRITICAL_HIGH_WATER',
        severity: 'MEDIUM',
        message: `Water level is critically high: ${metrics.percentage}% (${metrics.volumeLiters} Liters). Risk of overflow.`,
        timestamp: rawReading.timestamp
      });
    }
  } else {
    // 3. Sensor offline alert
    newAlerts.push({
      type: 'SENSOR_OFFLINE',
      severity: 'HIGH',
      message: `ESP32 Water Tank Sensor is offline: ${processedReading.error}`,
      timestamp: rawReading.timestamp
    });
  }

  // Determine resolved alerts (active alerts not in new alerts)
  for (const oldAlert of activeAlerts) {
    const stillActive = newAlerts.some(a => a.type === oldAlert.type);
    if (!stillActive) {
      try {
        await dbService.resolveAlertByType(oldAlert.type);
        console.log(`[Leak Detection] Alert resolved and logged: ${oldAlert.type}`);
      } catch (err) {
        console.error('[Leak Detection] Error resolving alert in SQLite:', err.message);
      }
    }
  }

  // Save brand new active alerts to SQLite
  for (const alert of newAlerts) {
    const isAlreadyActive = activeAlerts.some(a => a.type === alert.type);
    if (!isAlreadyActive) {
      try {
        await dbService.saveAlert(alert);
        console.warn(`[Leak Detection] New Alert logged to SQLite: ${alert.type} (${alert.severity})`);
      } catch (err) {
        console.error('[Leak Detection] Error logging alert to SQLite:', err.message);
      }
    }
  }

  activeAlerts = newAlerts;

  latestProcessedStatus = {
    timestamp: rawReading.timestamp,
    sensor: {
      device: rawReading.data?.device || 'ESP32',
      sensor: rawReading.data?.sensor || 'HC-SR04/DS18B20',
      status: processedReading.sensorStatus,
      rawDistanceCm: processedReading.distanceCm
    },
    metrics: {
      waterDepthCm: processedReading.waterDepthCm,
      percentage: processedReading.percentage,
      volumeLiters: processedReading.volumeLiters,
      isValid: processedReading.isValid,
      flowRate: processedReading.flowRate,
      dailyUsage: processedReading.dailyUsage,
      temperature: processedReading.temperature
    },
    leakAnalysis: leakAnalysis || { isLeakDetected: false, message: 'Calibrating / Insufficient data points' }, 
    alerts: activeAlerts
  };

  return latestProcessedStatus;
}

/**
 * Returns the current status of the water tank system.
 * If no readings exist, returns a template structure.
 */
export function getLatestStatus() {
  if (latestProcessedStatus) {
    return latestProcessedStatus;
  }

  return {
    timestamp: new Date().toISOString(),
    sensor: {
      device: 'ESP32',
      sensor: 'HC-SR04/DS18B20',
      status: 'No data gathered yet',
      rawDistanceCm: null
    },
    metrics: {
      waterDepthCm: 0,
      percentage: 0,
      volumeLiters: 0,
      isValid: false,
      flowRate: 0,
      dailyUsage: 0,
      temperature: 24.5
    },
    leakAnalysis: {
      isLeakDetected: false,
      message: 'No readings recorded yet'
    },
    alerts: []
  };
}

/**
 * Returns the history of readings up to a limit by querying SQLite.
 */
export async function getHistory(limit = 100) {
  try {
    return await dbService.fetchHistory(limit);
  } catch (err) {
    console.error('[Leak Detection] Error fetching history from SQLite:', err.message);
    // Fallback to in-memory cache
    const count = Math.min(limit, readingsHistory.length);
    return readingsHistory.slice(-count);
  }
}

/**
 * Returns the active alerts.
 */
export function getActiveAlerts() {
  return activeAlerts;
}

/**
 * Manual trigger to clear all active alerts in-memory and in SQLite.
 */
export async function clearActiveAlerts() {
  activeAlerts = [];
  if (latestProcessedStatus) {
    latestProcessedStatus.alerts = [];
  }
  try {
    await dbService.resolveAllAlerts();
  } catch (err) {
    console.error('[Leak Detection] Error clearing alerts in SQLite:', err.message);
  }
}

/**
 * Pre-populates the in-memory cache and active alerts from SQLite on startup.
 * Allows the leak detection algorithm to function immediately without waiting for polls.
 */
export async function loadHistoryFromDb() {
  try {
    const dbHistory = await dbService.fetchHistory(100);
    readingsHistory.length = 0;
    readingsHistory.push(...dbHistory);
    console.log(`[Leak Detection] Preloaded ${dbHistory.length} historical readings from SQLite.`);

    const dbAlerts = await dbService.fetchActiveAlerts();
    activeAlerts.length = 0;
    activeAlerts.push(...dbAlerts);
    console.log(`[Leak Detection] Loaded ${dbAlerts.length} active alerts from SQLite.`);

    if (dbHistory.length > 0) {
      const lastReading = dbHistory[dbHistory.length - 1];
      latestProcessedStatus = {
        timestamp: lastReading.timestamp,
        sensor: {
          device: 'ESP32',
          sensor: 'HC-SR04/DS18B20',
          status: lastReading.sensorStatus,
          rawDistanceCm: lastReading.distanceCm
        },
        metrics: {
          waterDepthCm: lastReading.waterDepthCm,
          percentage: lastReading.percentage,
          volumeLiters: lastReading.volumeLiters,
          isValid: lastReading.isValid,
          flowRate: lastReading.flowRate || 0,
          dailyUsage: lastReading.dailyUsage || 0,
          temperature: lastReading.temperature || 24.5
        },
        leakAnalysis: {
          isLeakDetected: activeAlerts.some(a => a.type === 'LEAK_DETECTED'),
          message: 'Restored from SQLite database'
        },
        alerts: activeAlerts
      };
    }
  } catch (error) {
    console.error('[Leak Detection] Failed to load history from database:', error.message);
  }
}
