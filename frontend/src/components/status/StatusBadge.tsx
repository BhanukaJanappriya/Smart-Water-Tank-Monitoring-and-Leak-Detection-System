import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ConnectionState } from "@/types/sensor";
import { connectionSeverity } from "@/utils/statusHelpers";

const connectionLabel: Record<ConnectionState, string> = {
  online: "Online",
  offline: "Offline",
  checking: "Checking",
};

const severityIcon = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  neutral: HelpCircle,
} as const;

const severityVariant = {
  success: "success",
  warning: "warning",
  danger: "danger",
  neutral: "neutral",
} as const;

export function ConnectionBadge({ state }: { state: ConnectionState }) {
  const severity = connectionSeverity(state);
  const Icon = severityIcon[severity];

  return (
    <Badge variant={severityVariant[severity]}>
      <Icon className="h-3.5 w-3.5" />
      {connectionLabel[state]}
    </Badge>
  );
}
