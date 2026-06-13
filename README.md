# 💧 Smart Water Tank Monitoring & Leak Detection System

A modern, responsive frontend dashboard for an **IoT-based smart water tank
monitoring and leak detection system**. The dashboard visualizes live
sensor data — water level, tank fill percentage, flow rate, temperature,
daily usage, and leak status — streamed from an **ESP32-based backend**
over a REST API.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?logo=vite&logoColor=white&style=flat-square)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwindcss&logoColor=white&style=flat-square)
![Recharts](https://img.shields.io/badge/Recharts-Data%20Viz-FF6384?style=flat-square)
![Axios](https://img.shields.io/badge/Axios-HTTP%20Client-5A29E4?logo=axios&logoColor=white&style=flat-square)
![ESP32](https://img.shields.io/badge/ESP32-IoT%20Hardware-E7352C?logo=espressif&logoColor=white&style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**Tags:** `iot` `esp32` `smart-water-tank` `leak-detection` `react` `typescript`
`vite` `tailwindcss` `dashboard` `real-time-monitoring` `recharts`
`embedded-systems` `water-management` `responsive-design`

---

## ✨ Features

- 📊 **Live KPI cards** — water level, tank fill %, flow rate, temperature,
  and daily usage with animated counters and trend indicators
- 🌊 **Animated tank visualization** — SVG wave animation that reflects the
  current fill percentage in real time
- 📈 **Interactive charts** — water level, temperature, flow rate, and daily
  usage history powered by Recharts
- 🚨 **Leak detection panel** — Normal / Warning / Leak states with a
  pulsing alert glow for critical conditions
- 🌡️ **Temperature & flow monitors** with severity-based status indicators
- 🟢 **System & connection status** — live online/offline detection with
  graceful error and retry states
- 🕘 **Recent activity table** — sortable, paginated sensor history log
- 🌗 **Light & dark themes** with persisted user preference
- 📱 **Fully responsive** layout for desktop, tablet, and mobile
- ⚡ **Smooth animations & transitions** throughout the UI

---

## 🛠️ Tech Stack

| Category         | Technology                              |
| ----------------- | ---------------------------------------- |
| Framework         | React 18 + TypeScript                   |
| Build Tool        | Vite                                    |
| Styling           | Tailwind CSS + shadcn/ui-style components |
| Icons             | Lucide React                            |
| Routing           | React Router                            |
| Charts            | Recharts                                |
| HTTP Client       | Axios                                   |
| Hardware Target   | ESP32 (sensor data source)              |

---

## 🚀 Getting Started

The frontend dashboard lives in the [`frontend/`](frontend) directory.

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173` by default.

---

## 🔌 API Configuration

The dashboard expects a REST API exposing:

- `GET /api/latest` — the most recent sensor reading
- `GET /api/history?limit=50` — historical readings for charts and the
  activity table

By default the API base URL is `http://localhost:5000/api`. To point at a
different backend, create a `.env.local` file based on
[`.env.example`](.env.example):

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

### Expected response shapes

`GET /api/latest`

```json
{
  "waterLevel": 72,
  "tankPercentage": 81,
  "flowRate": 4.3,
  "temperature": 28.7,
  "dailyUsage": 183,
  "leakStatus": "Normal",
  "timestamp": "2026-06-13T10:20:00"
}
```

`GET /api/history`

```json
[
  { "timestamp": "...", "waterLevel": 70, "flowRate": 4, "temperature": 28 }
]
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
C++/
  Ultrasonic_sensor.ino  - ESP32 firmware (sensor reading & API)
```

---

## 📜 Scripts

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
