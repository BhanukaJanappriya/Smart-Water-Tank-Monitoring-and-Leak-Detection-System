import { CloudRain, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/formatters";

interface RainStatusPanelProps {
  isRaining: boolean;
  timestamp: string | null;
}

export function RainStatusPanel({ isRaining, timestamp }: RainStatusPanelProps) {
  return (
    <Card className={cn("animate-fade-in-up", isRaining && "ring-2 ring-warning/40")}>
      <CardHeader>
        <CardTitle>Rain Detection Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "flex items-start gap-4 rounded-2xl border p-4 transition-all",
            isRaining ? "border-warning/20 bg-warning/5" : "border-success/20 bg-success/5"
          )}
        >
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
              isRaining ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
            )}
          >
            {isRaining ? <CloudRain className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">
              {isRaining ? "Rain Detected!" : "Dry / No Rain"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isRaining
                ? "Precipitation is detected by the raindrop sensor. Keep track of the tank level if it is exposed."
                : "The raindrop sensor reports dry conditions. No precipitation detected."}
            </p>
            <p className="text-xs text-muted-foreground">
              Last checked: {formatDateTime(timestamp)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
