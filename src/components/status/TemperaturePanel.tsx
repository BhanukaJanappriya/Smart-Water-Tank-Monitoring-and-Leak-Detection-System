import { Thermometer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/utils/cn";
import { temperatureLevel, temperatureSeverity, type SeverityLevel } from "@/utils/statusHelpers";
import { formatNumber } from "@/utils/formatters";

interface TemperaturePanelProps {
  temperature: number;
}

const levelDescription: Record<string, string> = {
  Safe: "Water temperature is within the safe operating range.",
  Hot: "Water is warmer than usual. Monitor for continued increases.",
  Critical: "Water temperature is critically high. Check heating sources immediately.",
};

const indicatorClasses: Record<SeverityLevel, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-primary",
};

const textClasses: Record<SeverityLevel, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-primary",
};

export function TemperaturePanel({ temperature }: TemperaturePanelProps) {
  const level = temperatureLevel(temperature);
  const severity = temperatureSeverity(temperature);
  const progressValue = Math.min(100, Math.max(0, (temperature / 60) * 100));

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Water Temperature</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", `${indicatorClasses[severity]}/10`, textClasses[severity])}>
            <Thermometer className="h-6 w-6" />
          </div>
          <div>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {formatNumber(temperature)}
              <span className="text-base font-medium text-muted-foreground">°C</span>
            </p>
            <p className={cn("text-sm font-semibold", textClasses[severity])}>{level}</p>
          </div>
        </div>

        <Progress value={progressValue} indicatorClassName={indicatorClasses[severity]} />

        <p className="text-xs text-muted-foreground">{levelDescription[level]}</p>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-success/10 py-2 font-medium text-success">Safe &lt; 35°C</div>
          <div className="rounded-lg bg-warning/10 py-2 font-medium text-warning">Hot 35-45°C</div>
          <div className="rounded-lg bg-danger/10 py-2 font-medium text-danger">Critical &gt; 45°C</div>
        </div>
      </CardContent>
    </Card>
  );
}
