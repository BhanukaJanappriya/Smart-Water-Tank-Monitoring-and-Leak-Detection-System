# Smart Water Tank Monitoring & Leak Detection System

A modern, responsive frontend dashboard for an IoT smart water tank
monitoring and leak detection system. The dashboard visualizes live
sensor data (water level, tank fill percentage, flow rate, temperature,
daily usage, and leak status) streamed from an ESP32-based backend over
a REST API.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui-style components
- Lucide React icons
- React Router
- Recharts
- Axios

## Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` by default.

## API Configuration

The dashboard expects a REST API exposing:

- `GET /api/latest` — the most recent sensor reading
- `GET /api/history?limit=50` — historical readings for charts and the
  activity table

By default the API base URL is `http://localhost:5000/api`. To point at
a different backend, create a `.env.local` file based on
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

## Project Structure

```
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
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
