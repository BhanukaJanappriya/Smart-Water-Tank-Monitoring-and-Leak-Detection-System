# Smart Water Tank Monitoring & Leak Detection System

This repository contains the source code for a Smart Water Tank Monitoring and Leak Detection System, designed to prevent water wastage and monitor tank levels in real-time.

## Project Architecture

The system consists of two main parts:
1. **IoT Node (ESP32)**: Reads distance to water using an HC-SR04 ultrasonic sensor and exposes a JSON API over WiFi/Hotspot containing raw distance data.
2. **Express Backend**: Polls the ESP32 sensor, calculates depth/volume/percentage metrics, manages historical logs, implements statistical leak detection using linear regression, and hosts interactive OpenAPI documentation.
3. **Frontend Dashboard**: A modern, responsive React/TypeScript dashboard that visualizes live sensor data (water level, tank fill percentage, flow rate, temperature, daily usage, and leak status) streamed from the Express backend over a REST API.

---

## 🎨 Frontend Dashboard

The frontend is a React 18 + Vite application using Tailwind CSS and shadcn/ui.

### Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` by default.

### API Configuration

The dashboard expects a REST API exposing:
- `GET /api/latest` — the most recent sensor reading
- `GET /api/history?limit=50` — historical readings for charts and the activity table

By default the API base URL is `http://localhost:3000/api` (assuming backend runs on 3000). To point at a different backend, create a `.env.local` file based on [`.env.example`](.env.example):
```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## ⚙️ Backend Setup

The Express backend is located in the [/backend](./backend) folder.
For installation instructions, API route specifications, and details about the leak-detection algorithm, please refer to the:
📄 **[Backend README](./backend/README.md)**

To run the backend server and its local ESP32 simulation utility:
1. Move to the backend folder:
   ```bash
   cd backend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Run the simulator (to mock sensor reads):
   ```bash
   npm run mock
   ```
4. Run the backend API server (runs on port 3000):
   ```bash
   npm run dev
   ```

### 🔌 IoT ESP32 Firmware
A sketch example of the firmware is provided in the repository configuration. It connects to a local WiFi/hotspot, initializes the trigger and echo pins for the ultrasonic sensor, and spins up a web server on port 80.
When the backend requests `http://<ESP32_IP>/`, it responds with:
```json
{
  "device": "ESP32",
  "sensor": "HC-SR04",
  "distance_cm": 45.2,
  "status": "ok"
}
```
