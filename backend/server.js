import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';

import config from './config.js';
import tankRoutes from './routes/tankRoutes.js';
import { fetchESP32Data } from './services/esp32Service.js';
import { addReading, loadHistoryFromDb } from './services/leakDetectionService.js';
import { initDb, close as closeDb } from './services/dbService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Load and serve OpenAPI document
try {
  const yamlFile = fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8');
  const swaggerDocument = YAML.parse(yamlFile);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log(`Swagger API Docs available at http://localhost:${config.port}/api-docs`);
} catch (error) {
  console.error('Failed to load or parse openapi.yaml:', error.message);
}

// Routes
app.use('/api/tank', tankRoutes);

// Fallback Route
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Water Tank Monitoring System Backend API',
    endpoints: {
      status: `http://localhost:${config.port}/api/tank/status`,
      history: `http://localhost:${config.port}/api/tank/history`,
      alerts: `http://localhost:${config.port}/api/tank/alerts`,
      config: `http://localhost:${config.port}/api/tank/config`,
      docs: `http://localhost:${config.port}/api-docs`
    }
  });
});

// Background Polling Worker
let pollingIntervalId = null;

async function pollDevice() {
  console.log(`[Polling Worker] Fetching sensor data from ESP32 at ${config.esp32Url}...`);
  const rawData = await fetchESP32Data();
  const processed = await addReading(rawData);
  
  if (processed.metrics.isValid) {
    console.log(`[Polling Worker] Success: Distance: ${processed.sensor.rawDistanceCm}cm, Level: ${processed.metrics.percentage}%, Volume: ${processed.metrics.volumeLiters}L`);
  } else {
    console.warn(`[Polling Worker] Sensor Error: ${processed.sensor.status}`);
  }

  if (processed.alerts.length > 0) {
    console.warn(`[Polling Worker] ACTIVE ALERTS (${processed.alerts.length}):`);
    processed.alerts.forEach(alert => {
      console.warn(`  - [${alert.type}] (${alert.severity}) ${alert.message}`);
    });
  }
}

function startPolling() {
  // Run immediate first poll
  pollDevice();

  // Set interval
  pollingIntervalId = setInterval(async () => {
    // If the interval time changes dynamically, we handles restarts
    await pollDevice();
  }, config.pollIntervalMs);
}

// Start Server
const server = app.listen(config.port, async () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`Targeting ESP32 at: ${config.esp32Url}`);
  
  try {
    // Initialize SQLite tables and preload cache from DB
    await initDb();
    await loadHistoryFromDb();
  } catch (error) {
    console.error('Failed to initialize database or preload history:', error.message);
  }
  
  startPolling();
});

// Graceful Shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function shutdown() {
  console.log('Shutting down server...');
  if (pollingIntervalId) {
    clearInterval(pollingIntervalId);
    console.log('Stopped background polling worker.');
  }
  try {
    await closeDb();
  } catch (err) {
    console.error('Error during database close:', err.message);
  }
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
}
