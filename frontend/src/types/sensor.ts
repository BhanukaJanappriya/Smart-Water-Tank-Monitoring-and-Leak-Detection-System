/**
 * Core domain types shared across the dashboard.
 * These mirror the JSON shapes returned by the ESP32 backend REST API.
 */

export type LeakStatus = "Normal" | "Warning" | "Leak Detected";

export type ConnectionState = "online" | "offline" | "checking";

export interface LatestReading {
  waterLevel: number; // cm - current water height
  tankPercentage: number; // % - tank fill level
  flowRate: number; // L/min - current flow rate
  temperature: number; // degC - water temperature
  dailyUsage: number; // L - total water used today
  rawDistance: number; // cm - actual sensor distance reading
  leakStatus: LeakStatus;
  timestamp: string; // ISO timestamp
}

export interface HistoryReading {
  timestamp: string;
  waterLevel: number;
  flowRate: number;
  temperature: number;
  tankPercentage?: number;
  dailyUsage?: number;
  leakStatus?: LeakStatus;
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
