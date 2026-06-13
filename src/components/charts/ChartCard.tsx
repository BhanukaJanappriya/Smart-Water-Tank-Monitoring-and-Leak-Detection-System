import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";

interface ChartCardProps {
  title: string;
  description?: string;
  loading?: boolean;
  empty?: boolean;
  height?: number;
  children: ReactNode;
}

export function ChartCard({ title, description, loading, empty, height = 280, children }: ChartCardProps) {
  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton style={{ height }} className="w-full" />
        ) : empty ? (
          <div style={{ height }} className="flex items-center justify-center">
            <EmptyState icon={BarChart3} title="No data yet" description="Waiting for sensor readings to arrive." />
          </div>
        ) : (
          <div style={{ height }}>{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
