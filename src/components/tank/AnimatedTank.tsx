import { cn } from "@/utils/cn";
import { tankFillSeverity } from "@/utils/statusHelpers";
import { formatNumber, formatPercent } from "@/utils/formatters";

interface AnimatedTankProps {
  percentage: number;
  waterLevel: number;
  className?: string;
}

const severityLabel: Record<string, string> = {
  success: "Healthy Level",
  warning: "Low Level",
  danger: "Critical Level",
  neutral: "Unknown",
};

const severityTextColor: Record<string, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-muted-foreground",
};

/**
 * A vertical tank gauge with an animated wave surface. The fill height is
 * driven purely by `percentage` so it works for any tank size.
 */
export function AnimatedTank({ percentage, waterLevel, className }: AnimatedTankProps) {
  const clamped = Math.min(100, Math.max(0, percentage));
  const severity = tankFillSeverity(clamped);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative h-72 w-44 sm:h-80 sm:w-48">
        {/* Tank shell */}
        <div className="absolute inset-0 rounded-[2rem] border-[6px] border-muted bg-muted/30 shadow-inner overflow-hidden">
          {/* Water fill */}
          <div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-tank to-tank-light transition-[height] duration-1000 ease-out"
            style={{ height: `${clamped}%` }}
          >
            {/* Wave layers */}
            <div className="absolute inset-x-0 -top-3 h-6 overflow-hidden">
              <svg
                className="absolute left-0 h-6 w-[200%] animate-wave text-tank-light/70"
                viewBox="0 0 200 20"
                preserveAspectRatio="none"
                fill="currentColor"
              >
                <path d="M0 10 Q 25 0, 50 10 T 100 10 T 150 10 T 200 10 V20 H0 Z" />
              </svg>
              <svg
                className="absolute left-0 h-5 w-[200%] animate-wave-slow text-tank/80"
                viewBox="0 0 200 20"
                preserveAspectRatio="none"
                fill="currentColor"
              >
                <path d="M0 12 Q 25 4, 50 12 T 100 12 T 150 12 T 200 12 V20 H0 Z" />
              </svg>
            </div>
          </div>

          {/* Measurement ticks */}
          <div className="pointer-events-none absolute inset-y-0 right-2 flex flex-col justify-between py-3 text-[10px] font-medium text-muted-foreground/70">
            {[100, 75, 50, 25, 0].map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
        </div>

        {/* Center readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="rounded-2xl bg-background/70 px-4 py-2 text-center backdrop-blur-sm">
            <span className="block text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {formatPercent(clamped)}
            </span>
            <span className="block text-xs font-medium text-muted-foreground">Tank Capacity</span>
          </span>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-1 text-center">
        <p className="text-sm text-muted-foreground">
          Current Height: <span className="font-semibold text-foreground">{formatNumber(waterLevel)} cm</span>
        </p>
        <span className={cn("text-sm font-semibold", severityTextColor[severity])}>{severityLabel[severity]}</span>
      </div>
    </div>
  );
}
