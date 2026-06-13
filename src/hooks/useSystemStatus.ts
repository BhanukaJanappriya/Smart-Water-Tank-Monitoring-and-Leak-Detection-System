import { useMemo } from "react";
import { useOnlineStatus } from "./useOnlineStatus";
import type { ConnectionState, LatestReading, SystemStatus } from "@/types/sensor";

interface UseSystemStatusArgs {
  data: LatestReading | null;
  error: string | null;
  loading: boolean;
}

const STALE_THRESHOLD_MS = 30_000;

/**
 * Derives the health of each layer of the stack (device, network, API,
 * database) from the latest reading fetch result. This keeps the System
 * Status panel honest without requiring a dedicated health endpoint.
 */
export function useSystemStatus({ data, error, loading }: UseSystemStatusArgs): SystemStatus {
  const isOnline = useOnlineStatus();

  return useMemo(() => {
    if (!isOnline) {
      return {
        esp32: "offline",
        wifi: "offline",
        backendApi: "offline",
        database: "offline",
        lastUpdated: data?.timestamp ?? null,
      };
    }

    if (loading && !data) {
      return {
        esp32: "checking",
        wifi: "checking",
        backendApi: "checking",
        database: "checking",
        lastUpdated: null,
      };
    }

    if (error || !data) {
      return {
        esp32: "offline",
        wifi: "online",
        backendApi: "offline",
        database: "offline",
        lastUpdated: data?.timestamp ?? null,
      };
    }

    const age = Date.now() - new Date(data.timestamp).getTime();
    const deviceState: ConnectionState = age > STALE_THRESHOLD_MS ? "checking" : "online";

    return {
      esp32: deviceState,
      wifi: "online",
      backendApi: "online",
      database: "online",
      lastUpdated: data.timestamp,
    };
  }, [data, error, loading, isOnline]);
}
