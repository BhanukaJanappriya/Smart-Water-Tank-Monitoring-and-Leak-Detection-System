import type { TooltipProps } from "recharts";

/**
 * Shared tooltip styling for all dashboard charts so hover states look
 * consistent with the glass/card aesthetic.
 */
export function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-semibold text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}
