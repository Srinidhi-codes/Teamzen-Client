"use client";

import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Total item count — enables “Showing X–Y of Z” */
  total?: number;
  pageSize?: number;
  /** Label after the count, e.g. “items”, “employees” */
  label?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  total,
  pageSize,
  label = "items",
  className,
}: PaginationProps) {
  if (totalPages <= 0) return null;

  const showRange =
    typeof total === "number" && typeof pageSize === "number" && total > 0;

  const from = showRange ? (currentPage - 1) * pageSize + 1 : 0;
  const to = showRange ? Math.min(currentPage * pageSize, total) : 0;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (pageNumber) =>
      pageNumber === 1 ||
      pageNumber === totalPages ||
      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row",
        className
      )}
    >
      {showRange ? (
        <div className="pl-0 text-sm text-muted-foreground sm:pl-2">
          Showing{" "}
          <span className="font-medium text-foreground">{from}</span>
          <span className="mx-1">–</span>
          <span className="font-medium text-foreground">{to}</span>
          <span className="mx-1.5">of</span>
          <span className="font-medium text-foreground">{total}</span>
          <span className="ml-1">{label}</span>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground sm:pl-2">
          Page{" "}
          <span className="font-medium text-foreground">{currentPage}</span>
          <span className="mx-1">of</span>
          <span className="font-medium text-foreground">{totalPages}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-9 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          Previous
        </button>

        {pages.map((pageNumber, index) => {
          const prev = pages[index - 1];
          const showEllipsis = prev !== undefined && pageNumber - prev > 1;

          return (
            <div key={pageNumber} className="flex items-center gap-1.5">
              {showEllipsis && (
                <span className="px-1 text-sm text-muted-foreground/40">…</span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(pageNumber)}
                className={cn(
                  "h-9 w-9 rounded-md text-sm font-medium transition-colors",
                  currentPage === pageNumber
                    ? "border border-transparent bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {pageNumber}
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-9 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
