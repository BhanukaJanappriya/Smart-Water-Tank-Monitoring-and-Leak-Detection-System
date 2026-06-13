import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { OfflineBanner } from "@/components/common/OfflineBanner";
import { useLatestReading } from "@/hooks/useLatestReading";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import type { LatestReading, SystemStatus } from "@/types/sensor";

export interface DashboardOutletContext {
  latest: LatestReading | null;
  previous: LatestReading | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  systemStatus: SystemStatus;
}

export default function AppLayout() {
  const { data, previous, loading, error, retry } = useLatestReading({ pollIntervalMs: 5000 });
  const systemStatus = useSystemStatus({ data, error, loading });
  const isOnline = useOnlineStatus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {!isOnline && <OfflineBanner />}
      <Navbar apiStatus={systemStatus.backendApi} />
      <main className="container py-6 sm:py-8">
        <Outlet context={{ latest: data, previous, loading, error, retry, systemStatus } satisfies DashboardOutletContext} />
      </main>
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Smart Water Tank Monitoring &amp; Leak Detection System &middot; Built with React, TypeScript &amp; Tailwind CSS
      </footer>
    </div>
  );
}
