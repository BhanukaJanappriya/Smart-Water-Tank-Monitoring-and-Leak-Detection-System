import type { HistoryReading } from "@/types/sensor";
import { formatChartTime } from "./formatters";

export interface ChartPoint {
  time: string;
  waterLevel: number;
  temperature: number;
}

/**
 * Converts raw history readings into chart-friendly points with a
 * human-readable time label, sorted oldest -> newest (left to right).
 */
export function toChartPoints(history: HistoryReading[]): ChartPoint[] {
  return [...history]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((entry) => ({
      time: formatChartTime(entry.timestamp),
      waterLevel: entry.waterLevel,
      temperature: entry.temperature,
    }));
}
