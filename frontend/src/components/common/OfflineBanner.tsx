import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-danger px-4 py-2 text-sm font-medium text-danger-foreground animate-fade-in-up">
      <WifiOff className="h-4 w-4" />
      You're offline. Showing the last data received until connection is restored.
    </div>
  );
}
