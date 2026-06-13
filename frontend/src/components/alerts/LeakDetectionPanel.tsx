import { AlertOctagon, AlertTriangle, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/formatters";
import type { LeakStatus } from "@/types/sensor";

interface LeakDetectionPanelProps {
  status: LeakStatus;
  timestamp: string | null;
}

const config: Record<
  LeakStatus,
  { icon: typeof ShieldCheck; title: string; description: string; classes: string; iconClasses: string }
> = {
  Normal: {
    icon: ShieldCheck,
    title: "All Systems Normal",
    description: "No leaks detected. Water flow and tank levels are within expected ranges.",
    classes: "border-success/20 bg-success/5",
    iconClasses: "bg-success/10 text-success",
  },
  Warning: {
    icon: AlertTriangle,
    title: "Unusual Flow Pattern",
    description: "Flow readings look slightly abnormal. Keep an eye on the tank over the next few minutes.",
    classes: "border-warning/20 bg-warning/5",
    iconClasses: "bg-warning/10 text-warning",
  },
  "Leak Detected": {
    icon: AlertOctagon,
    title: "Leak Detected!",
    description: "Continuous outflow detected with no matching consumption pattern. Inspect pipework immediately.",
    classes: "border-danger/30 bg-danger/5 animate-pulse-glow",
    iconClasses: "bg-danger/10 text-danger",
  },
};

export function LeakDetectionPanel({ status, timestamp }: LeakDetectionPanelProps) {
  const { icon: Icon, title, description, classes, iconClasses } = config[status];
  const isLeak = status === "Leak Detected";

  return (
    <Card className={cn("animate-fade-in-up", isLeak && "ring-2 ring-danger/40")}>
      <CardHeader>
        <CardTitle>Leak Detection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("flex items-start gap-4 rounded-2xl border p-4 transition-all", classes)}>
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", iconClasses, isLeak && "animate-pulse-glow")}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground">Last checked: {formatDateTime(timestamp)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
