import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'water_tank.db');
const outputPath = path.resolve(__dirname, 'sensor_history.csv');

console.log('⏳ Connecting to database...');
const db = new (sqlite3.verbose()).Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to open database:', err.message);
    process.exit(1);
  }
});

console.log('🔍 Fetching readings...');
db.all('SELECT * FROM readings ORDER BY timestamp ASC', (err, rows) => {
  if (err) {
    console.error('❌ Error fetching data:', err.message);
    db.close();
    process.exit(1);
  }

  if (rows.length === 0) {
    console.log('⚠️ No readings found in the database.');
    db.close();
    return;
  }

  console.log(`📊 Found ${rows.length} readings. Converting to CSV...`);
  
  // Define CSV Headers
  const headers = ['ID', 'Timestamp', 'Valid', 'Distance (cm)', 'Depth (cm)', 'Percentage (%)', 'Volume (L)', 'Temperature (C)', 'Sensor Status', 'Raining', 'Error'];
  const csvRows = [headers.join(',')];

  for (const row of rows) {
    const csvRow = [
      row.id,
      `"${row.timestamp}"`,
      row.is_valid === 1 ? 'Yes' : 'No',
      row.distance_cm !== null ? row.distance_cm : '',
      row.water_depth_cm !== null ? row.water_depth_cm : '',
      row.percentage !== null ? row.percentage : '',
      row.volume_liters !== null ? row.volume_liters : '',
      row.temperature !== null ? row.temperature : '',
      `"${row.sensor_status || ''}"`,
      row.is_raining === 1 ? 'Yes' : 'No',
      `"${row.error || ''}"`
    ];
    csvRows.push(csvRow.join(','));
  }

  const csvContent = csvRows.join('\n');
  
  fs.writeFile(outputPath, csvContent, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('❌ Error writing CSV file:', writeErr.message);
    } else {
      console.log(`✅ Success! Data written to: ${outputPath}`);
    }
    db.close();
  });
});
