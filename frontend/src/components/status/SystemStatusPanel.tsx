import { Cpu, Database, Server, Wifi, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionBadge } from "./StatusBadge";
import { formatRelativeTime } from "@/utils/formatters";
import type { SystemStatus } from "@/types/sensor";

interface SystemStatusPanelProps {
  status: SystemStatus;
}

export function SystemStatusPanel({ status }: SystemStatusPanelProps) {
  const rows = [
    { label: "ESP32 Device", icon: Cpu, state: status.esp32 },
    { label: "WiFi Network", icon: Wifi, state: status.wifi },
    { label: "Backend API", icon: Server, state: status.backendApi },
    { label: "Database", icon: Database, state: status.database },
  ];

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map(({ label, icon: Icon, state }) => (
          <div key={label} className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </div>
            <ConnectionBadge state={state} />
          </div>
        ))}

        <div className="mt-2 flex items-center justify-between border-t border-border/60 px-3 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Last Updated
          </div>
          <span className="font-medium text-foreground">{formatRelativeTime(status.lastUpdated)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
