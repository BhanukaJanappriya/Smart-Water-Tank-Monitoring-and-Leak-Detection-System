import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "./ChartCard";
import type { ChartPoint } from "@/utils/chartHelpers";
import { ChartTooltip } from "./ChartTooltip";

interface WaterLevelChartProps {
  data: ChartPoint[];
  loading?: boolean;
}

export function WaterLevelChart({ data, loading }: WaterLevelChartProps) {
  return (
    <ChartCard title="Water Level History" description="Tank water height over time (cm)" loading={loading} empty={!loading && data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="waterLevelStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(217 91% 60%)" />
              <stop offset="100%" stopColor="hsl(199 89% 56%)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-muted-foreground" />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="fill-muted-foreground" unit=" cm" />
          <Tooltip content={<ChartTooltip />} />
          <Line
            type="monotone"
            dataKey="waterLevel"
            name="Water Level"
            stroke="url(#waterLevelStroke)"
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
