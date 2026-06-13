import type { HistoryReading } from "@/types/sensor";
import { formatChartTime } from "./formatters";

export interface ChartPoint {
  time: string;
  waterLevel: number;
  flowRate: number;
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
      flowRate: entry.flowRate,
      temperature: entry.temperature,
    }));
}

export interface DailyUsagePoint {
  day: string;
  usage: number;
}

/**
 * Groups history readings by calendar day and takes the maximum reported
 * `dailyUsage` value for each day (the counter resets daily, so the max
 * represents the day's total).
 */
export function aggregateDailyUsage(history: HistoryReading[]): DailyUsagePoint[] {
  const byDay = new Map<string, number>();

  for (const entry of history) {
    if (entry.dailyUsage === undefined) continue;
    const date = new Date(entry.timestamp);
    const key = date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
    const current = byDay.get(key) ?? 0;
    byDay.set(key, Math.max(current, entry.dailyUsage));
  }

  return Array.from(byDay.entries())
    .map(([day, usage]) => ({ day, usage }))
    .slice(-7);
}
