import type { ConnectionState, Trend } from "@/types/sensor";

export type SeverityLevel = "success" | "warning" | "danger" | "neutral";

export function rainSeverity(isRaining: boolean | undefined): SeverityLevel {
  return isRaining ? "warning" : "success";
}

export type TemperatureLevel = "Safe" | "Hot" | "Critical";

export function temperatureLevel(temperature: number): TemperatureLevel {
  if (temperature >= 45) return "Critical";
  if (temperature >= 35) return "Hot";
  return "Safe";
}

export function temperatureSeverity(temperature: number): SeverityLevel {
  const level = temperatureLevel(temperature);
  if (level === "Critical") return "danger";
  if (level === "Hot") return "warning";
  return "success";
}

export function connectionSeverity(state: ConnectionState): SeverityLevel {
  switch (state) {
    case "online":
      return "success";
    case "checking":
      return "warning";
    case "offline":
    default:
      return "danger";
  }
}

/**
 * Computes a simple trend by comparing the latest value against the
 * previous value in a history series.
 */
export function computeTrend(current: number, previous: number | undefined): Trend {
  if (previous === undefined || previous === 0) {
    return { direction: "flat", value: 0, percent: 0 };
  }
  const diff = current - previous;
  const percent = (diff / previous) * 100;
  const direction = Math.abs(diff) < 1e-6 ? "flat" : diff > 0 ? "up" : "down";
  return { direction, value: diff, percent };
}

export const tankFillSeverity = (percentage: number): SeverityLevel => {
  if (percentage <= 15) return "danger";
  if (percentage <= 35) return "warning";
  return "success";
};
