import { Droplet, Gauge, Waves } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import { formatNumber } from "@/utils/formatters";
import { cn } from "@/utils/cn";

interface FlowMonitorProps {
  currentFlow: number;
  averageFlow: number;
  totalUsage: number;
}

export function FlowMonitor({ currentFlow, averageFlow, totalUsage }: FlowMonitorProps) {
  const isFlowing = currentFlow > 0.05;

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Flow Monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
            <Waves className={cn("h-7 w-7", isFlowing && "animate-pulse")} />
            {isFlowing && <span className="absolute inset-0 rounded-2xl border-2 border-secondary/40 animate-pulse-glow" />}
          </div>
          <div>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              <AnimatedNumber value={currentFlow} decimals={2} />
              <span className="text-base font-medium text-muted-foreground"> L/min</span>
            </p>
            <p className="text-sm text-muted-foreground">{isFlowing ? "Water is flowing" : "No flow detected"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted/60 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" />
              Average Flow
            </div>
            <p className="text-lg font-bold text-foreground">{formatNumber(averageFlow, 2)} L/min</p>
          </div>
          <div className="rounded-xl bg-muted/60 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Droplet className="h-3.5 w-3.5" />
              Total Used Today
            </div>
            <p className="text-lg font-bold text-foreground">{formatNumber(totalUsage, 0)} L</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
