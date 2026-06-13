import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { formatNumber } from "@/utils/formatters";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  className?: string;
}

/**
 * Renders a numeric value that smoothly counts up/down toward new readings
 * instead of snapping, giving the dashboard a "live" feel.
 */
export function AnimatedNumber({ value, decimals = 1, className }: AnimatedNumberProps) {
  const animated = useAnimatedCounter(value);
  return <span className={className}>{formatNumber(animated, decimals)}</span>;
}
