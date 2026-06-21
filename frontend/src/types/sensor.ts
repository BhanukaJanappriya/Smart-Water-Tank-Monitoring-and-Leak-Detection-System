/**
 * Core domain types shared across the dashboard.
 * These mirror the JSON shapes returned by the ESP32 backend REST API.
 */

export type ConnectionState = "online" | "offline" | "checking";

export interface LatestReading {
  waterLevel: number; // cm - current water height
  tankPercentage: number; // % - tank fill level
  temperature: number; // degC - water temperature
  isRaining: boolean;
  timestamp: string; // ISO timestamp
}

export interface HistoryReading {
  timestamp: string;
  waterLevel: number;
  temperature: number;
  tankPercentage?: number;
  isRaining?: boolean;
}

export interface SystemStatus {
  esp32: ConnectionState;
  wifi: ConnectionState;
  backendApi: ConnectionState;
  database: ConnectionState;
  lastUpdated: string | null;
}

export type TrendDirection = "up" | "down" | "flat";

export interface Trend {
  direction: TrendDirection;
  value: number; // absolute change since previous reading
  percent: number; // percent change since previous reading
}
