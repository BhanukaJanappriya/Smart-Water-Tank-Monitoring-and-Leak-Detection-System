import { useCallback, useEffect, useState } from "react";
import { fetchDailyUsage } from "@/services/sensorService";
import type { DailyUsage } from "@/types/sensor";

export function useDailyUsage(days = 7) {
  const [data, setData] = useState<DailyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const usage = await fetchDailyUsage(days);
      setData(usage);
      setError(null);
    } catch {
      setError("Unable to load daily usage.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [load]);

  return { data, loading, error, retry: load };
}
