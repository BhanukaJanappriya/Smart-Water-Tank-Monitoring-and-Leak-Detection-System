import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import type { ChartPoint } from "@/utils/chartHelpers";
import { ChartTooltip } from "./ChartTooltip";

interface TemperatureChartProps {
  data: ChartPoint[];
  loading?: boolean;
}

export function TemperatureChart({ data, loading }: TemperatureChartProps) {
  return (
    <ChartCard title="Temperature History" description="Water temperature over time (°C)" loading={loading} empty={!loading && data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-muted-foreground" />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-muted-foreground" unit="°" />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="temperature"
            name="Temperature"
            stroke="hsl(var(--warning))"
            strokeWidth={3}
            dot={false}
            isAnimationActive
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
