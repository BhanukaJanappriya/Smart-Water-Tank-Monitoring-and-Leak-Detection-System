import express from 'express';
import config from '../config.js';
import { fetchESP32Data } from '../services/esp32Service.js';
import { 
  getLatestStatus, 
  getHistory, 
  getActiveAlerts, 
  clearActiveAlerts, 
  addReading 
} from '../services/leakDetectionService.js';

const router = express.Router();

/**
 * @route GET /api/tank/status
 * @desc Get latest tank level metrics and leak status
 * @query {boolean} fetch - If true, triggers an immediate request to the ESP32 instead of returning the last polled status
 */
router.get('/status', async (req, res) => {
  const forceFetch = req.query.fetch === 'true';

  if (forceFetch) {
    try {
      const rawData = await fetchESP32Data();
      const status = await addReading(rawData);
      return res.json(status);
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to perform on-demand reading: ' + error.message 
      });
    }
  }

  // Return the latest processed status (from background poll or previous fetch)
  res.json(getLatestStatus());
});

/**
 * @route GET /api/tank/latest
 * @desc Get latest tank reading in the format expected by the frontend
 */
router.get('/latest', (req, res) => {
  const status = getLatestStatus();
  
  // Transform the backend status object to the frontend's LatestReading type
  const latestReading = {
    waterLevel: status.metrics.waterDepthCm,
    tankPercentage: Math.round(status.metrics.percentage),
    temperature: status.metrics.temperature || 24.5,
    isRaining: status.metrics.isRaining || false,
    timestamp: status.timestamp
  };

  res.json(latestReading);
});

/**
 * @route GET /api/tank/history
 * @desc Retrieve historical readings (Mapped for frontend HistoryReading type)
 */
router.get('/history', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 100;
  try {
    const history = await getHistory(limit);
    
    // Map internal history to frontend HistoryReading type
    const mappedHistory = history.map(h => ({
      timestamp: h.timestamp,
      waterLevel: h.waterDepthCm,
      temperature: h.temperature || 24.5,
      tankPercentage: Math.round(h.percentage),
      isRaining: h.isRaining || false
    }));

    res.json(mappedHistory);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve history: ' + error.message 
    });
  }
});

/**
 * @route GET /api/tank/alerts
 * @desc Retrieve active level or leak alerts
 */
router.get('/alerts', (req, res) => {
  res.json(getActiveAlerts());
});

/**
 * @route POST /api/tank/alerts/clear
 * @desc Manually clear current active alerts
 */
router.post('/alerts/clear', async (req, res) => {
  try {
    await clearActiveAlerts();
    res.json({ success: true, message: 'Active alerts cleared successfully.' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to clear alerts: ' + error.message 
    });
  }
});

/**
 * @route GET /api/tank/config
 * @desc Get the current physical/calibration parameters of the tank
 */
router.get('/config', (req, res) => {
  res.json(config);
});

/**
 * @route POST /api/tank/config
 * @desc Update physical/calibration parameters of the tank dynamically
 */
router.post('/config', (req, res) => {
  const { 
    esp32Url, 
    pollIntervalMs, 
    tankHeightCm, 
    tankFullDistanceCm, 
    tankEmptyDistanceCm, 
    tankRadiusCm,
    leakThresholdCmPerMin
  } = req.body;

  try {
    if (esp32Url !== undefined) config.esp32Url = String(esp32Url);
    if (pollIntervalMs !== undefined) config.pollIntervalMs = parseInt(pollIntervalMs, 10);
    if (tankHeightCm !== undefined) config.tankHeightCm = parseFloat(tankHeightCm);
    if (tankFullDistanceCm !== undefined) config.tankFullDistanceCm = parseFloat(tankFullDistanceCm);
    if (tankEmptyDistanceCm !== undefined) config.tankEmptyDistanceCm = parseFloat(tankEmptyDistanceCm);
    if (tankRadiusCm !== undefined) config.tankRadiusCm = parseFloat(tankRadiusCm);
    if (leakThresholdCmPerMin !== undefined) config.leakThresholdCmPerMin = parseFloat(leakThresholdCmPerMin);

    res.json({ 
      success: true, 
      message: 'Configuration updated successfully.',
      currentConfig: config
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: 'Invalid values provided: ' + error.message 
    });
  }
});

/**
 * @route GET /api/tank/raw/ultrasonic
 * @desc Get raw ultrasonic sensor data (distance in cm)
 */
router.get('/raw/ultrasonic', (req, res) => {
  const status = getLatestStatus();
  res.json({
    sensor: 'Ultrasonic Sensor',
    rawDistanceCm: status.sensor.rawDistanceCm !== undefined ? status.sensor.rawDistanceCm : null,
    status: status.sensor.status || 'offline',
    timestamp: status.timestamp
  });
});

/**
 * @route GET /api/tank/raw/temperature
 * @desc Get raw temperature sensor data (temperature in C)
 */
router.get('/raw/temperature', (req, res) => {
  const status = getLatestStatus();
  res.json({
    sensor: 'Temperature Sensor',
    temperatureC: status.metrics.temperature !== undefined ? status.metrics.temperature : null,
    status: status.sensor.status || 'offline',
    timestamp: status.timestamp
  });
});

/**
 * @route GET /api/tank/raw/rain
 * @desc Get raw rain detection sensor data (raining status)
 */
router.get('/raw/rain', (req, res) => {
  const status = getLatestStatus();
  res.json({
    sensor: 'Raindrop Sensor',
    isRaining: status.metrics.isRaining !== undefined ? status.metrics.isRaining : false,
    status: status.sensor.status || 'offline',
    timestamp: status.timestamp
  });
});

export default router;
