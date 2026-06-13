# 💧 Smart Water Tank Monitoring & Leak Detection System

A modern, responsive frontend dashboard and Express backend for an **IoT-based smart water tank monitoring and leak detection system**. Designed to prevent water wastage and monitor tank levels in real-time.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?logo=vite&logoColor=white&style=flat-square)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwindcss&logoColor=white&style=flat-square)
![Recharts](https://img.shields.io/badge/Recharts-Data%20Viz-FF6384?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white&style=flat-square)
![Express](https://img.shields.io/badge/Express-API-000000?logo=express&logoColor=white&style=flat-square)
![ESP32](https://img.shields.io/badge/ESP32-IoT%20Hardware-E7352C?logo=espressif&logoColor=white&style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**Tags:** `iot` `esp32` `smart-water-tank` `leak-detection` `react` `typescript` `vite` `tailwindcss` `dashboard` `real-time-monitoring` `recharts` `embedded-systems` `water-management` `responsive-design` `nodejs` `express`

---

## 🏗️ Project Architecture

The system consists of three main parts:
1. **IoT Node (ESP32)**: Reads distance to water using an HC-SR04 ultrasonic sensor and exposes a JSON API over WiFi/Hotspot containing raw distance data.
2. **Express Backend**: Polls the ESP32 sensor, calculates depth/volume/percentage metrics, manages historical logs, implements statistical leak detection using linear regression, and hosts interactive OpenAPI documentation.
3. **Frontend Dashboard**: A modern, responsive React/TypeScript dashboard that visualizes live sensor data streamed from the Express backend over a REST API.

---

## ✨ Features

- 📊 **Live KPI cards** — water level, tank fill %, flow rate, temperature, and daily usage with animated counters and trend indicators
- 🌊 **Animated tank visualization** — SVG wave animation that reflects the current fill percentage in real time
- 📈 **Interactive charts** — water level, temperature, flow rate, and daily usage history powered by Recharts
- 🚨 **Leak detection panel** — Normal / Warning / Leak states with a pulsing alert glow for critical conditions
- 📉 **Statistical Leak Detection** — linear regression based algorithm on the backend to accurately identify leaks
- 🟢 **System & connection status** — live online/offline detection with graceful error and retry states
- 🕘 **Recent activity table** — sortable, paginated sensor history log
- 🌗 **Light & dark themes** with persisted user preference

---

## 🎨 Frontend Dashboard

The frontend is a React 18 + Vite application using Tailwind CSS and shadcn/ui.

### Getting Started

The frontend dashboard lives in the [`frontend/`](frontend) directory.

```bash
cd frontend
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

---

## 🔌 IoT ESP32 Firmware

A sketch example of the firmware is provided in the `C++/Ultrasonic_sensor.ino` file. It connects to a local WiFi/hotspot, initializes the trigger and echo pins for the ultrasonic sensor, and spins up a web server on port 80.
When the backend requests `http://<ESP32_IP>/`, it responds with:
```json
{
  "device": "ESP32",
  "sensor": "HC-SR04",
  "distance_cm": 45.2,
  "status": "ok"
}
```

---

## 📁 Project Structure

```
frontend/
  src/
    components/
      cards/    - KPI cards
      charts/   - Recharts-based line/area/bar charts
      layout/   - App shell, navbar
      status/   - Temperature, flow, system status panels
      tank/     - Animated tank visualization
      alerts/   - Leak detection panel
      common/   - Shared UI helpers (skeletons, empty/error states, table)
      ui/       - shadcn/ui-style primitives
    pages/      - Route-level pages (Dashboard, History, NotFound)
    hooks/      - Data fetching & polling hooks
    services/   - Axios API client and sensor service
    types/      - Shared TypeScript types
    contexts/   - Theme (light/dark) context
    utils/      - Formatters, status helpers, chart helpers
backend/
  routes/       - Express API routes
  services/     - ESP32 polling, leak detection, database services
C++/
  Ultrasonic_sensor.ino  - ESP32 firmware (sensor reading & API)
```

---

## 📜 Frontend Scripts

Run from inside the [`frontend/`](frontend) directory:

| Command           | Description                          |
| ------------------ | -------------------------------------- |
| `npm run dev`      | Start the development server          |
| `npm run build`    | Type-check and build for production   |
| `npm run preview`  | Preview the production build          |
| `npm run lint`     | Run ESLint                             |
| `npm run mock`     | Run a local mock API server           |

---

## 📄 License

This project is licensed under the MIT License.
