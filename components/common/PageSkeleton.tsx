export function PageSkeleton({
  variant = "default",
}: {
  variant?: "default" | "punch" | "split";
}) {
  if (variant === "punch") {
    return (
      <div className="animate-pulse space-y-8 pb-20" aria-busy="true" aria-label="Loading">
        <div className="space-y-3">
          <div className="h-8 w-48 rounded-md bg-muted" />
          <div className="h-4 w-72 max-w-full rounded-md bg-muted/70" />
        </div>
        <div className="h-40 rounded-xl border border-border bg-card" />
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-16 flex-1 rounded-lg bg-muted/60" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="h-64 rounded-xl border border-border bg-card lg:col-span-8" />
          <div className="h-64 rounded-xl border border-border bg-card lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (variant === "split") {
    return (
      <div className="animate-pulse space-y-8 pb-20" aria-busy="true" aria-label="Loading">
        <div className="space-y-3">
          <div className="h-8 w-40 rounded-md bg-muted" />
          <div className="h-4 w-64 max-w-full rounded-md bg-muted/70" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <div className="h-12 rounded-xl bg-muted/60" />
            <div className="h-80 rounded-xl border border-border bg-card" />
          </div>
          <div className="h-72 rounded-xl border border-border bg-card lg:col-span-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-8 pb-20" aria-busy="true" aria-label="Loading">
      <div className="space-y-3">
        <div className="h-8 w-52 rounded-md bg-muted" />
        <div className="h-4 w-80 max-w-full rounded-md bg-muted/70" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div className="h-72 rounded-xl border border-border bg-card" />
    </div>
  );
}
