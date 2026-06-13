import { useCallback, useEffect, useState } from "react";
import { fetchHistory } from "@/services/sensorService";
import type { HistoryReading } from "@/types/sensor";

interface UseHistoryOptions {
  limit?: number;
  pollIntervalMs?: number;
}

interface UseHistoryResult {
  data: HistoryReading[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Polls GET /history on an interval and exposes the resulting series for
 * charts and the recent activity table.
 */
export function useHistory({ limit = 50, pollIntervalMs = 15000 }: UseHistoryOptions = {}): UseHistoryResult {
  const [data, setData] = useState<HistoryReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const history = await fetchHistory(limit);
      setData(history);
      setError(null);
    } catch {
      setError("Unable to load sensor history. Retrying...");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
    const interval = setInterval(load, pollIntervalMs);
    return () => clearInterval(interval);
  }, [load, pollIntervalMs]);

  const retry = useCallback(() => {
    setLoading(true);
    load();
  }, [load]);

  return { data, loading, error, retry };
}
