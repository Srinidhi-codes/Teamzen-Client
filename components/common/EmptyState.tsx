import Image from "next/image";
import { cn } from "@/lib/utils";

type EmptyStateSize = "compact" | "default" | "wide";

type EmptyStateProps = {
  src?: string;
  icon?: string;
  title: string;
  description?: string;
  className?: string;
  size?: EmptyStateSize;
  children?: React.ReactNode;
  action?: { label: string; onClick: () => void };
};

const minH: Record<EmptyStateSize, string> = {
  compact: "min-h-[180px] sm:min-h-[200px]",
  default: "min-h-[220px] sm:min-h-[260px]",
  wide: "min-h-[240px] sm:min-h-[300px]",
};

/** Illustrated empty state — art fills the parent card; copy sits in the left cream space. */
export function EmptyState({
  src,
  icon,
  title,
  description,
  className,
  size = "default",
  children,
  action,
}: EmptyStateProps) {
  if (src) {
    return (
      <div className={cn("relative w-full overflow-hidden", minH[size], className)}>
        <Image
          src={src}
          alt=""
          fill
          loading="lazy"
          decoding="async"
          sizes="100vw"
          className="object-cover object-right"
        />
        <div className="absolute inset-y-0 left-0 z-10 flex w-[58%] max-w-lg flex-col justify-center px-5 py-6 text-left sm:w-[46%] sm:px-8">
          <h3 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            {title}
          </h3>
          {description ? (
            <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-600">
              {description}
            </p>
          ) : null}
          {action ? (
            <button type="button" onClick={action.onClick} className="btn-primary mt-4 w-fit">
              {action.label}
            </button>
          ) : null}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-10 text-center sm:py-12",
        className
      )}
    >
      {icon ? <div className="text-5xl">{icon}</div> : null}
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {title}
        </h3>
        {description ? (
          <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? (
        <button type="button" onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      ) : null}
      {children}
    </div>
  );
}
