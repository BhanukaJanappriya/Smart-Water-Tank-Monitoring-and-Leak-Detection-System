# Smart Water Tank Monitoring & Leak Detection - Express Backend

This directory contains the Express backend for the Smart Water Tank Monitoring and Leak Detection System. It serves as an intermediary between the ESP32 IoT device (equipped with an HC-SR04 ultrasonic sensor) and user applications, implementing robust level calculations and a statistical leak-detection algorithm.

## Features

- **Real-Time Polling**: Periodically requests distance data from the ESP32 sensor.
- **Water Level Calculations**: Computes water depth (cm), fill percentage (%), and volume (Liters) based on tank dimensions.
- **Advanced Leak Detection**: Employs a linear regression model over historical data. If it detects a steady, continuous drop in water level (high correlation, negative slope) exceeding a threshold, it triggers a critical leak alert.
- **Dynamic Calibration**: Tank height, radius, full/empty thresholds, and leak triggers can be configured dynamically at runtime via API endpoints.
- **OpenAPI Standardized API**: Designed strictly using OpenAPI 3.0 specifications.
- **Interactive Documentation**: Served via Swagger UI at `/api-docs`.
- **ESP32 Simulator**: A utility script is included to mock tank behavior (leaks, refills, stability) for offline development and local testing.

---

## Directory Structure

```text
backend/
├── config.js            # Configuration loader and parser
├── mock-esp32.js        # Offline ESP32 simulator for testing
├── openapi.yaml         # OpenAPI 3.0 API specifications
├── package.json         # Dependencies and script definitions
├── server.js            # Main Express app and background poll worker
├── routes/
│   └── tankRoutes.js    # Express route declarations (status, history, alerts, config)
└── services/
    ├── esp32Service.js  # Client to interface with physical ESP32
    └── leakDetectionService.js # Process metrics and evaluate leak patterns
```

---

## Installation & Setup

### 1. Install Dependencies
Run npm install using cmd or bash:
```bash
npm install
```

### 2. Configure Environment Variables
A `.env` file is generated in the root of the `backend` folder. You can customize the settings:
- `PORT`: Port the Express server runs on (default: `3000`).
- `ESP32_URL`: The IP address of your ESP32 (e.g., `http://10.234.106.74`).
- `POLL_INTERVAL_MS`: How often the backend polls the ESP32 (default: `10000` ms).
- `TANK_HEIGHT_CM`: Physical height of the tank.
- `TANK_FULL_DISTANCE_CM`: Measured distance when the tank is 100% full (minimum clearance distance from sensor to water).
- `TANK_EMPTY_DISTANCE_CM`: Measured distance when the tank is empty (sensor to bottom of the tank).
- `TANK_RADIUS_CM`: Radius of the tank for volume calculation in Liters.
- `LEAK_THRESHOLD_CM_PER_MIN`: Rate of drop (cm/minute) during non-usage to flag as a leak.

---

## Running the Application

### Option A: Local Testing with Simulator (Recommended for offline testing)
If you don't have the ESP32 connected or active:

1. **Start the ESP32 Simulator** (runs on port 8080):
   ```bash
   npm run mock
   ```
2. **Update `.env`** to point to the local simulator:
   ```env
   ESP32_URL=http://localhost:8080
   ```
3. **Start the Backend server** (in a separate terminal):
   ```bash
   npm run dev
   ```

### Option B: Production / Physical IoT Run
Ensure your ESP32 is powered on and connected to the hotspot, then configure its IP in `.env` (e.g., `ESP32_URL=http://10.234.106.74`).
Start the backend server:
```bash
npm start
```

---

## API Endpoints (OpenAPI 3.0)

All APIs are documented in [openapi.yaml](./openapi.yaml). When the server is running, visit **`http://localhost:3000/api-docs`** in your browser for the interactive Swagger UI.

### Summary of Routes:

| Method | Endpoint | Description | Query / Body Parameters |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/tank/status` | Get latest level metrics, sensor details, leak analyses, and active alerts. | `fetch=true` (force live read bypassing cache) |
| **GET** | `/api/tank/history` | Get recent reading logs. | `limit=100` (max readings to fetch) |
| **GET** | `/api/tank/alerts` | Get active level and leak alerts. | None |
| **POST** | `/api/tank/alerts/clear`| Manually clear all active warnings/alerts. | None |
| **GET** | `/api/tank/config` | View current physical calibration parameters. | None |
| **POST** | `/api/tank/config` | Update calibration parameters dynamically. | JSON body with properties (e.g., `{ "tankRadiusCm": 40 }`) |

---

## Technical Details: Leak Detection Algorithm

To identify a leak without access to external flow meters, the backend uses **Simple Linear Regression** over the last 3 minutes of water depth readings:

1. A background polling worker logs water levels every 10 seconds.
2. The service performs linear regression on recent data points:
   - $y$ is the water depth (cm).
   - $x$ is time elapsed (seconds).
3. It calculates:
   - **Slope ($m$)**: Represents the rate of water level change.
   - **Correlation Coefficient ($r$)**: Measures how closely the water level matches a straight line.
4. **Alert Trigger**: If $r < -0.85$ (highly steady linear decrease) and the slope translates to a loss greater than or equal to `LEAK_THRESHOLD_CM_PER_MIN`, a `LEAK_DETECTED` critical alert is generated.
5. This regression approach filters out short-term fluctuations or standard rapid usage (which has high-variance, non-linear steps) and flags slow, continuous, steady leaks.
