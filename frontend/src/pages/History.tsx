import { useOutletContext } from "react-router-dom";
import type { DashboardOutletContext } from "@/components/layout/AppLayout";
import { useHistory } from "@/hooks/useHistory";
import { WaterLevelChart } from "@/components/charts/WaterLevelChart";
import { TemperatureChart } from "@/components/charts/TemperatureChart";
import { FlowRateChart } from "@/components/charts/FlowRateChart";
import { DailyUsageChart } from "@/components/charts/DailyUsageChart";
import { RecentActivityTable } from "@/components/common/RecentActivityTable";
import { ErrorState } from "@/components/common/ErrorState";
import { aggregateDailyUsage, toChartPoints } from "@/utils/chartHelpers";

export default function History() {
  const { systemStatus } = useOutletContext<DashboardOutletContext>();
  const { data, loading, error, retry } = useHistory({ limit: 200, pollIntervalMs: 20000 });

  const chartPoints = toChartPoints(data);
  const dailyUsageData = aggregateDailyUsage(data);

  return (
    <div className="space-y-8">
      <section className="animate-fade-in-up text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">Sensor History</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Full history of readings from the {systemStatus.backendApi === "online" ? "connected" : "last connected"} ESP32 device
        </p>
      </section>

      {error && data.length === 0 ? (
        <ErrorState title="Unable to load history" message={error} onRetry={retry} />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <WaterLevelChart data={chartPoints} loading={loading} />
            <TemperatureChart data={chartPoints} loading={loading} />
            <FlowRateChart data={chartPoints} loading={loading} />
            <DailyUsageChart data={dailyUsageData} loading={loading} />
          </section>

          <section>
            <RecentActivityTable data={data} loading={loading} pageSize={10} />
          </section>
        </>
      )}
    </div>
  );
}
