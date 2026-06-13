/**
 * Formatting helpers used throughout the dashboard so number/date
 * presentation stays consistent across cards, charts and tables.
 */

export function formatNumber(value: number, decimals = 1): string {
  if (Number.isNaN(value)) return "--";
  return value.toFixed(decimals);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatTime(timestamp: string | null): string {
  if (!timestamp) return "--";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatDateTime(timestamp: string | null): string {
  if (!timestamp) return "--";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatRelativeTime(timestamp: string | null): string {
  if (!timestamp) return "Never";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Never";

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 5) return "Just now";
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return formatDateTime(timestamp);
}

export function formatChartTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
