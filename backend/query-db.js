import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'water_tank.db');

console.log('====================================================');
console.log('🔍 SQLite Database Inspector');
console.log(`Path: ${dbPath}`);
console.log('====================================================\n');

const db = new (sqlite3.verbose()).Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to open database:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  // Check tables existence first
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='readings';", (err, row) => {
    if (err || !row) {
      console.log('⚠️  The database tables do not exist yet. Please run the backend server first to initialize them.\n');
      db.close();
      return;
    }

    // 1. Get Readings Summary
    db.get('SELECT COUNT(*) as count, MIN(timestamp) as first, MAX(timestamp) as last FROM readings', (err, summary) => {
      if (err) {
        console.error('Error fetching readings summary:', err.message);
        return;
      }
      console.log('📊 Readings Summary:');
      console.log(`  - Total logged readings: ${summary.count}`);
      if (summary.count > 0) {
        console.log(`  - Log duration range:  [${summary.first}]  to  [${summary.last}]`);
      }
      console.log('');
    });

    // 2. Get Last 5 Logged Readings
    db.all('SELECT * FROM readings ORDER BY timestamp DESC LIMIT 5', (err, rows) => {
      if (err) {
        console.error('Error reading readings table:', err.message);
        return;
      }
      console.log('📈 Latest 5 Readings:');
      if (rows.length === 0) {
        console.log('  (No readings logged yet)');
      } else {
        const formatted = rows.map(r => ({
          Timestamp: r.timestamp,
          Valid: r.is_valid === 1 ? '✅ Yes' : '❌ No',
          'Distance (cm)': r.distance_cm,
          'Depth (cm)': r.water_depth_cm,
          'Percent (%)': `${r.percentage}%`,
          'Volume (L)': r.volume_liters,
          Status: r.sensor_status
        }));
        console.table(formatted);
      }
      console.log('');
    });

    // 3. Get Active Alerts
    db.all('SELECT * FROM alerts WHERE resolved = 0 ORDER BY timestamp DESC', (err, rows) => {
      if (err) {
        console.error('Error reading alerts table:', err.message);
        return;
      }
      console.log('🚨 Active Alerts (Unresolved):');
      if (rows.length === 0) {
        console.log('  ✅ No active alerts.');
      } else {
        const formatted = rows.map(r => ({
          Timestamp: r.timestamp,
          Type: r.type,
          Severity: r.severity,
          Message: r.message
        }));
        console.table(formatted);
      }
      console.log('');
    });

    // 4. Get Resolved Alerts Count
    db.get('SELECT COUNT(*) as count FROM alerts WHERE resolved = 1', (err, summary) => {
      if (err) {
        console.error('Error reading alerts summary:', err.message);
      } else {
        console.log(`✅ Historical Resolved Alerts: ${summary.count}`);
      }
      console.log('\n====================================================');
      db.close();
    });
  });
});
