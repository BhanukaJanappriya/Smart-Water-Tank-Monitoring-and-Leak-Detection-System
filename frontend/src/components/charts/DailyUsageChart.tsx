import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import type { DailyUsagePoint } from "@/utils/chartHelpers";
import { ChartTooltip } from "./ChartTooltip";

interface DailyUsageChartProps {
  data: DailyUsagePoint[];
  loading?: boolean;
}

export function DailyUsageChart({ data, loading }: DailyUsageChartProps) {
  return (
    <ChartCard title="Daily Usage" description="Total water consumed per day (L)" loading={loading} empty={!loading && data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-muted-foreground" />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-muted-foreground" unit=" L" />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="usage" name="Usage" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={600}>
            {data.map((entry) => (
              <Cell key={entry.day} fill="hsl(var(--primary))" fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
