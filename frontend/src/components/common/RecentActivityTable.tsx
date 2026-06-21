import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatNumber } from "@/utils/formatters";
import { rainSeverity } from "@/utils/statusHelpers";
import type { HistoryReading } from "@/types/sensor";

interface RecentActivityTableProps {
  data: HistoryReading[];
  loading?: boolean;
  pageSize?: number;
}

type SortKey = "timestamp" | "waterLevel" | "temperature";
type SortDirection = "asc" | "desc";

const columns: { key: SortKey; label: string }[] = [
  { key: "timestamp", label: "Timestamp" },
  { key: "waterLevel", label: "Water Level (cm)" },
  { key: "temperature", label: "Temperature (°C)" },
];

const severityVariant = {
  success: "success",
  warning: "warning",
  danger: "danger",
  neutral: "neutral",
} as const;

export function RecentActivityTable({ data, loading, pageSize = 8 }: RecentActivityTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const aValue = sortKey === "timestamp" ? new Date(a.timestamp).getTime() : a[sortKey];
      const bValue = sortKey === "timestamp" ? new Date(b.timestamp).getTime() : b[sortKey];
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });
    return copy;
  }, [data, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRows = sorted.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
    setPage(0);
  };

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest sensor readings, newest first</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState icon={ListChecks} title="No activity yet" description="Readings will appear here as they arrive." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key}>
                      <button
                        className="flex items-center gap-1 transition-colors hover:text-foreground"
                        onClick={() => toggleSort(col.key)}
                      >
                        {col.label}
                        {sortKey === col.key ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </button>
                    </TableHead>
                  ))}
                  <TableHead>Rain Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((row, idx) => {
                  const raining = row.isRaining ?? false;
                  return (
                    <TableRow key={`${row.timestamp}-${idx}`}>
                      <TableCell className="whitespace-nowrap font-medium text-foreground">
                        {formatDateTime(row.timestamp)}
                      </TableCell>
                       <TableCell>{formatNumber(row.waterLevel)} cm</TableCell>
                      <TableCell>{formatNumber(row.temperature)}°C</TableCell>
                      <TableCell>
                        <Badge variant={severityVariant[rainSeverity(raining)]}>
                          {raining ? "Raining" : "No Rain"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {currentPage + 1} of {totalPages} &middot; {sorted.length} records
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
