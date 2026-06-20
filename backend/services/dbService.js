import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Save database file in the backend folder
const dbPath = path.resolve(__dirname, '../water_tank.db');

// Connect to SQLite
const db = new (sqlite3.verbose()).Database(dbPath, (err) => {
  if (err) {
    console.error('[Database] Connection Error:', err.message);
  } else {
    console.log('[Database] Connected to SQLite database at:', dbPath);
  }
});

/**
 * Executes a run query (INSERT/UPDATE/DELETE) and returns a promise
 */
export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        console.error(`[Database] Query error: "${sql}"`, err.message);
        reject(err);
      } else {
        resolve(this); // 'this' contains changes and lastID
      }
    });
  });
}

/**
 * Executes a query that returns multiple rows
 */
export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error(`[Database] Query error: "${sql}"`, err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Initializes the database tables
 */
export async function initDb() {
  try {
    // 1. Readings Table
    await run(`
      CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT UNIQUE,
        is_valid INTEGER NOT NULL,
        distance_cm REAL,
        water_depth_cm REAL,
        percentage REAL,
        volume_liters REAL,
        temperature REAL,
        sensor_status TEXT,
        error TEXT
      )
    `);

    // Create timestamp index for faster queries
    await run(`
      CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON readings(timestamp)
    `);

    // 2. Alerts Table
    await run(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        message TEXT NOT NULL,
        details TEXT,
        resolved INTEGER DEFAULT 0,
        resolved_at TEXT
      )
    `);

    console.log('[Database] Tables initialized successfully.');
  } catch (error) {
    console.error('[Database] Failed to initialize tables:', error.message);
    throw error;
  }
}

/**
 * Saves a single processed sensor reading
 */
export async function saveReading(reading) {
  const sql = `
    INSERT INTO readings (timestamp, is_valid, distance_cm, water_depth_cm, percentage, volume_liters, temperature, sensor_status, error)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    reading.timestamp,
    reading.isValid ? 1 : 0,
    reading.distanceCm,
    reading.waterDepthCm,
    reading.percentage,
    reading.volumeLiters,
    reading.temperature,
    reading.sensorStatus,
    reading.error
  ];
  return run(sql, params);
}

/**
 * Saves an alert to the database
 */
export async function saveAlert(alert) {
  const sql = `
    INSERT INTO alerts (timestamp, type, severity, message, details, resolved)
    VALUES (?, ?, ?, ?, ?, 0)
  `;
  const detailsStr = alert.details ? JSON.stringify(alert.details) : null;
  const params = [
    alert.timestamp,
    alert.type,
    alert.severity,
    alert.message,
    detailsStr
  ];
  return run(sql, params);
}

/**
 * Fetches recent readings from the database
 */
export async function fetchHistory(limit = 100) {
  const sql = `
    SELECT * FROM readings
    ORDER BY timestamp DESC
    LIMIT ?
  `;
  const rows = await all(sql, [limit]);

  // Map back to JavaScript object names (snake_case database to camelCase API structure)
  return rows.map(r => ({
    timestamp: r.timestamp,
    isValid: r.is_valid === 1,
    distanceCm: r.distance_cm,
    waterDepthCm: r.water_depth_cm,
    percentage: r.percentage,
    volumeLiters: r.volume_liters,
    temperature: r.temperature,
    sensorStatus: r.sensor_status,
    error: r.error
  })).reverse(); // Return in chronological order
}

/**
 * Fetches active (unresolved) alerts
 */
export async function fetchActiveAlerts() {
  const sql = `
    SELECT * FROM alerts
    WHERE resolved = 0
    ORDER BY timestamp DESC
  `;
  const rows = await all(sql);
  return rows.map(r => ({
    id: r.id,
    timestamp: r.timestamp,
    type: r.type,
    severity: r.severity,
    message: r.message,
    details: r.details ? JSON.parse(r.details) : null
  }));
}

/**
 * Marks all active alerts as resolved
 */
export async function resolveAllAlerts() {
  const now = new Date().toISOString();
  const sql = `
    UPDATE alerts
    SET resolved = 1, resolved_at = ?
    WHERE resolved = 0
  `;
  return run(sql, [now]);
}

/**
 * Marks a specific alert type as resolved
 */
export async function resolveAlertByType(type) {
  const now = new Date().toISOString();
  const sql = `
    UPDATE alerts
    SET resolved = 1, resolved_at = ?
    WHERE type = ? AND resolved = 0
  `;
  return run(sql, [now, type]);
}

/**
 * Closes the database connection safely
 */
export function close() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error('[Database] Error closing SQLite connection:', err.message);
        reject(err);
      } else {
        console.log('[Database] SQLite connection closed.');
        resolve();
      }
    });
  });
}
