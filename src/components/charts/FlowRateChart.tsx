import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import type { ChartPoint } from "@/utils/chartHelpers";
import { ChartTooltip } from "./ChartTooltip";

interface FlowRateChartProps {
  data: ChartPoint[];
  loading?: boolean;
}

export function FlowRateChart({ data, loading }: FlowRateChartProps) {
  return (
    <ChartCard title="Flow Rate History" description="Water flow rate over time (L/min)" loading={loading} empty={!loading && data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="flowRateFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-muted-foreground" />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-muted-foreground" unit=" L/m" />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="flowRate"
            name="Flow Rate"
            stroke="hsl(var(--secondary))"
            strokeWidth={3}
            fill="url(#flowRateFill)"
            isAnimationActive
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
