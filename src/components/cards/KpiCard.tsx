import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import { cn } from "@/utils/cn";
import type { SeverityLevel } from "@/utils/statusHelpers";
import type { Trend } from "@/types/sensor";

interface KpiCardProps {
  label: string;
  value: number;
  unit?: string;
  description?: string;
  icon: LucideIcon;
  decimals?: number;
  trend?: Trend;
  severity?: SeverityLevel;
  /** Render a custom value instead of the animated number (e.g. a string status) */
  valueOverride?: string;
}

const severityStyles: Record<SeverityLevel, string> = {
  success: "from-success/15 to-success/5 text-success",
  warning: "from-warning/15 to-warning/5 text-warning",
  danger: "from-danger/15 to-danger/5 text-danger",
  neutral: "from-primary/15 to-primary/5 text-primary",
};

export function KpiCard({
  label,
  value,
  unit,
  description,
  icon: Icon,
  decimals = 1,
  trend,
  severity = "neutral",
  valueOverride,
}: KpiCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-glow animate-fade-in-up">
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-70 blur-2xl transition-opacity group-hover:opacity-100",
          severityStyles[severity],
        )}
      />
      <CardContent className="relative flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br", severityStyles[severity])}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5">
          {valueOverride ? (
            <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{valueOverride}</span>
          ) : (
            <span className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              <AnimatedNumber value={value} decimals={decimals} />
            </span>
          )}
          {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
        </div>

        <div className="flex items-center justify-between gap-2">
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {trend && trend.direction !== "flat" && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-semibold",
                trend.direction === "up" ? "text-success" : "text-danger",
              )}
            >
              {trend.direction === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(trend.percent).toFixed(1)}%
            </span>
          )}
          {trend && trend.direction === "flat" && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
              <Minus className="h-3 w-3" />
              No change
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
