import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/common/Pagination";

export interface Column<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  total?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  paginationLabel?: string;
  sortConfig?: SortConfig | null;
  onSortChange?: (sort: SortConfig | null) => void;
}

const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

export function DataTable<T>({
  columns,
  data,
  isLoading,
  onRowClick,
  total,
  currentPage,
  pageSize,
  onPageChange,
  paginationLabel = "items",
  sortConfig,
  onSortChange,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-border/50 bg-muted">
          <svg
            className="h-8 w-8 text-muted-foreground/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold">No results</h3>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
          This list is empty or no items match your current filters.
        </p>
      </div>
    );
  }

  const handleSort = (key: string) => {
    if (!onSortChange) return;

    if (sortConfig?.key === key) {
      if (sortConfig.direction === "asc") {
        onSortChange({ key, direction: "desc" });
      } else {
        onSortChange(null);
      }
    } else {
      onSortChange({ key, direction: "asc" });
    }
  };

  const totalPages = pageSize ? Math.ceil((total || 0) / pageSize) : 0;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-5 text-left text-premium-label ${
                    col.sortable && onSortChange
                      ? "cursor-pointer transition-colors hover:text-primary"
                      : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && onSortChange && (
                      <div className="text-muted-foreground/50 group-hover:text-primary/70">
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {data?.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "cursor-pointer duration-300 hover:bg-muted/50" : "duration-300"}
              >
                {columns.map((col) => {
                  const value = getNestedValue(row, col.key);
                  return (
                    <td
                      key={col.key}
                      className={cn(
                        "whitespace-nowrap px-6 py-5 text-premium-data",
                        col.className
                      )}
                    >
                      {col.render ? col.render(value, row) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && currentPage && onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          total={total}
          pageSize={pageSize}
          label={paginationLabel}
        />
      )}
    </div>
  );
}
