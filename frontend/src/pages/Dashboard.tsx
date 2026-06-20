import { useOutletContext } from "react-router-dom";
import { Gauge, ShieldAlert, Thermometer, Waves } from "lucide-react";
import type { DashboardOutletContext } from "@/components/layout/AppLayout";
import { KpiCard } from "@/components/cards/KpiCard";
import { KpiCardSkeleton } from "@/components/cards/KpiCardSkeleton";
import { AnimatedTank } from "@/components/tank/AnimatedTank";
import { LeakDetectionPanel } from "@/components/alerts/LeakDetectionPanel";
import { TemperaturePanel } from "@/components/status/TemperaturePanel";
import { SystemStatusPanel } from "@/components/status/SystemStatusPanel";
import { WaterLevelChart } from "@/components/charts/WaterLevelChart";
import { TemperatureChart } from "@/components/charts/TemperatureChart";
import { RecentActivityTable } from "@/components/common/RecentActivityTable";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { useHistory } from "@/hooks/useHistory";
import { computeTrend, leakSeverity, tankFillSeverity, temperatureSeverity } from "@/utils/statusHelpers";
import { toChartPoints } from "@/utils/chartHelpers";

export default function Dashboard() {
  const { latest, previous, loading, error, retry, systemStatus } = useOutletContext<DashboardOutletContext>();
  const { data: history, loading: historyLoading } = useHistory({ limit: 50, pollIntervalMs: 15000 });

  const chartPoints = toChartPoints(history);

  if (error && !latest) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md">
          <ErrorState title="Unable to connect" message={error} onRetry={retry} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="animate-fade-in-up text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Smart Water Tank Monitoring System
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">Real-time IoT Monitoring Dashboard</p>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {loading && !latest
          ? Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
          : latest && (
              <>
                <KpiCard
                  label="Tank Level"
                  value={latest.tankPercentage}
                  unit="%"
                  decimals={0}
                  description="Current fill capacity"
                  icon={Gauge}
                  severity={tankFillSeverity(latest.tankPercentage)}
                  trend={computeTrend(latest.tankPercentage, previous?.tankPercentage)}
                />
                <KpiCard
                  label="Water Height"
                  value={latest.waterLevel}
                  unit="cm"
                  description="Distance from sensor"
                  icon={Waves}
                  trend={computeTrend(latest.waterLevel, previous?.waterLevel)}
                />
                <KpiCard
                  label="Temperature"
                  value={latest.temperature}
                  unit="°C"
                  description="Water temperature"
                  icon={Thermometer}
                  severity={temperatureSeverity(latest.temperature)}
                  trend={computeTrend(latest.temperature, previous?.temperature)}
                />
                <KpiCard
                  label="Leak Status"
                  value={0}
                  valueOverride={latest.leakStatus}
                  description="Live leak detection"
                  icon={ShieldAlert}
                  severity={leakSeverity(latest.leakStatus)}
                />
              </>
            )}
      </section>

      {/* Tank visualization + Leak detection */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="animate-fade-in-up lg:col-span-1">
          <CardContent className="flex flex-col items-center justify-center p-6">
            {latest ? (
              <AnimatedTank percentage={latest.tankPercentage} waterLevel={latest.waterLevel} />
            ) : (
              <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">Loading tank data...</div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {latest && <LeakDetectionPanel status={latest.leakStatus} timestamp={latest.timestamp} />}
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WaterLevelChart data={chartPoints} loading={historyLoading} />
        <TemperatureChart data={chartPoints} loading={historyLoading} />
      </section>

      {/* Status panels */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {latest && <TemperaturePanel temperature={latest.temperature} />}
        <SystemStatusPanel status={systemStatus} />
      </section>

      {/* Recent activity */}
      <section>
        <RecentActivityTable data={history} loading={historyLoading} />
      </section>
    </div>
  );
}
