import { useCallback, useEffect, useRef, useState } from "react";
import { fetchLatestReading } from "@/services/sensorService";
import type { LatestReading } from "@/types/sensor";

interface UseLatestReadingOptions {
  pollIntervalMs?: number;
}

interface UseLatestReadingResult {
  data: LatestReading | null;
  previous: LatestReading | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Polls GET /latest on an interval and exposes the current + previous
 * reading so components can derive trends (e.g. flow rate going up/down).
 */
export function useLatestReading({ pollIntervalMs = 5000 }: UseLatestReadingOptions = {}): UseLatestReadingResult {
  const [data, setData] = useState<LatestReading | null>(null);
  const [previous, setPrevious] = useState<LatestReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<LatestReading | null>(null);

  const load = useCallback(async () => {
    try {
      const reading = await fetchLatestReading();
      setPrevious(dataRef.current);
      dataRef.current = reading;
      setData(reading);
      setError(null);
    } catch {
      setError("Unable to reach the water tank API. Retrying...");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, pollIntervalMs);
    return () => clearInterval(interval);
  }, [load, pollIntervalMs]);

  const retry = useCallback(() => {
    setLoading(true);
    load();
  }, [load]);

  return { data, previous, loading, error, retry };
}
