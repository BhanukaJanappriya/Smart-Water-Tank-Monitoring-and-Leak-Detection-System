import { apiClient } from "./api";
import type { HistoryReading, LatestReading } from "@/types/sensor";

/**
 * Fetches the most recent sensor reading from the ESP32 backend.
 * GET /api/latest
 */
export async function fetchLatestReading(): Promise<LatestReading> {
  const { data } = await apiClient.get<LatestReading>("/latest");
  return data;
}

/**
 * Fetches historical sensor readings used to populate charts and the
 * recent activity table.
 * GET /api/history
 */
export async function fetchHistory(limit = 50): Promise<HistoryReading[]> {
  const { data } = await apiClient.get<HistoryReading[]>("/history", {
    params: { limit },
  });
  return data;
}
