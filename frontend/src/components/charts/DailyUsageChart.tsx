import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import { ChartTooltip } from "./ChartTooltip";
import type { DailyUsage } from "@/types/sensor";

interface DailyUsageChartProps {
  data: DailyUsage[];
  loading?: boolean;
}

export function DailyUsageChart({ data, loading }: DailyUsageChartProps) {
  // Format dates for X-axis
  const chartData = data.map(d => ({
    ...d,
    time: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  }));

  return (
    <ChartCard title="Daily Water Usage" description="Estimated water consumption (Liters)" loading={loading} empty={!loading && data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="usageBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(217 91% 60%)" />
              <stop offset="100%" stopColor="hsl(217 91% 60% / 0.2)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-muted-foreground" />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-muted-foreground" unit=" L" />
          <Tooltip content={<ChartTooltip />} />
          <Bar
            dataKey="usageLiters"
            name="Usage"
            fill="url(#usageBarGradient)"
            radius={[4, 4, 0, 0]}
            isAnimationActive
            animationDuration={600}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
