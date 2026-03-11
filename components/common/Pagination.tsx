"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.slice(
    Math.max(0, currentPage - 2),
    Math.min(totalPages, currentPage + 1)
  );

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-5 py-2.5 rounded-xl bg-muted text-foreground font-bold text-xs uppercase tracking-widest hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
      >
        Prev
      </button>


      {/* Page Numbers */}
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-xl font-black text-xs transition-all duration-300 active:scale-90 ${page === currentPage
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
              : "bg-card border border-border text-foreground hover:bg-muted"
            }`}
        >
          {page}
        </button>
      ))}


      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-5 py-2.5 rounded-xl bg-muted text-foreground font-bold text-xs uppercase tracking-widest hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
      >
        Next
      </button>

    </div>
  );
}
