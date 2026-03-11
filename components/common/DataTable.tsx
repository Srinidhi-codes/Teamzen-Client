import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";


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
  // Pagination Props
  total?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  paginationLabel?: string;
  // Sort Props
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
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-premium-label animate-pulse">Synchronizing Data Matrix...</p>
      </div>
    );
  }


  if (!data || data.length === 0) {
    return (
      <div className="premium-card text-center max-w-2xl mx-auto py-16 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-muted rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-border/50">
          <svg className="w-12 h-12 text-muted-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-premium-h2 mb-2">Zero Identifiers Detected</h3>
        <p className="text-muted-foreground font-medium leading-relaxed max-w-sm mx-auto">The requested data set is currently empty or doesn't match the current filters.</p>
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
      <div className="overflow-x-auto rounded-4xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>

              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-5 text-left text-premium-label ${col.sortable && onSortChange ? "cursor-pointer hover:text-primary transition-colors" : ""}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >

                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && onSortChange && (
                      <div className="text-muted-foreground/50 group-hover:text-primary/70">

                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5 opacity-50" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">

            {data?.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={`
                   duration-300
                  ${onRowClick ? "hover:bg-muted/50 cursor-pointer" : ""}
                `}

              >
                {columns.map((col) => {
                  const value = getNestedValue(row, col.key);
                  return (
                    <td
                      key={col.key}
                      className={cn("px-6 py-5 whitespace-nowrap text-premium-data", col.className)}
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

      {/* Pagination Footer */}
      {totalPages > 0 && currentPage && onPageChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-6 bg-card/50 rounded-4xl border border-border backdrop-blur-sm shadow-sm ring-1 ring-border/50">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-2">
            Showing <span className="text-primary font-black">{(currentPage - 1) * (pageSize || 0) + 1}</span>
            <span className="mx-1.5">—</span>
            <span className="text-primary font-black">{Math.min(currentPage * (pageSize || 0), total || 0)}</span>
            <span className="mx-2 text-muted-foreground/50">Of</span>
            <span className="text-foreground font-black">{total}</span>
            <span className="ml-2">{paginationLabel}</span>
          </div>


          <Pagination className="mx-0 w-auto">
            <PaginationContent className="gap-1.5">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) onPageChange(currentPage - 1);
                  }}
                  className={`rounded-xl border-border text-muted-foreground font-bold hover:bg-card hover:text-primary hover:border-primary/20 transition-all ${currentPage <= 1 ? "pointer-events-none opacity-40 shadow-none border-dashed" : "cursor-pointer shadow-sm"}`}
                />

              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNumber = i + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === pageNumber}
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(pageNumber);
                        }}
                        className={`w-10 h-10 rounded-xl font-bold transition-all duration-300 ${currentPage === pageNumber ? "bg-primary text-primary-foreground border-transparent shadow-lg shadow-primary/20 scale-110" : "bg-card text-muted-foreground border-border hover:border-primary/20 hover:text-primary shadow-sm"}`}
                      >

                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <PaginationEllipsis key={pageNumber} className="text-muted-foreground/30 scale-75" />;

                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) onPageChange(currentPage + 1);
                  }}
                  className={`rounded-xl border-border text-muted-foreground font-bold hover:bg-card hover:text-primary hover:border-primary/20 transition-all ${currentPage >= totalPages ? "pointer-events-none opacity-40 shadow-none border-dashed" : "cursor-pointer shadow-sm"}`}
                />

              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
