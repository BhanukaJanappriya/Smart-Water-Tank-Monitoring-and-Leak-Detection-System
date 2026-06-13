import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the .env file in the same directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  esp32Url: process.env.ESP32_URL || 'http://10.234.106.74',
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || '10000', 10),
  tankHeightCm: parseFloat(process.env.TANK_HEIGHT_CM || '100'),
  tankFullDistanceCm: parseFloat(process.env.TANK_FULL_DISTANCE_CM || '10'),
  tankEmptyDistanceCm: parseFloat(process.env.TANK_EMPTY_DISTANCE_CM || '90'),
  tankRadiusCm: parseFloat(process.env.TANK_RADIUS_CM || '30'),
  leakThresholdCmPerMin: parseFloat(process.env.LEAK_THRESHOLD_CM_PER_MIN || '0.1'),
};

export default config;
