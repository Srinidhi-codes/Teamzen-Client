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
  contentClassName?: string;
  headingClassName?: string;
  descriptionClassName?: string;
  imageClassName?: string;
};

const minH: Record<EmptyStateSize, string> = {
  compact: "min-h-[220px] sm:min-h-[280px]",
  default: "min-h-[320px] sm:min-h-[400px]",
  wide: "h-[360px] sm:h-[460px]",
};

const headingSize: Record<EmptyStateSize, string> = {
  compact: "text-base font-semibold",
  default: "text-base sm:text-lg font-semibold",
  wide: "text-xl sm:text-2xl lg:text-3xl font-bold",
};

const descSize: Record<EmptyStateSize, string> = {
  compact: "text-xs sm:text-sm max-w-xs",
  default: "text-sm max-w-xs",
  wide: "text-sm sm:text-base max-w-md leading-relaxed",
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
  contentClassName,
  headingClassName,
  descriptionClassName,
  imageClassName,
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
          className={cn("object-cover object-bottom", imageClassName)}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 z-10 flex w-[60%] max-w-lg flex-col justify-center px-5 py-6 text-left sm:w-[46%] sm:px-8",
            contentClassName
          )}
        >
          <h3
            className={cn(
              headingSize[size],
              "tracking-tight text-slate-900",
              headingClassName
            )}
          >
            {title}
          </h3>
          {description ? (
            <p
              className={cn(
                "mt-2 text-slate-600",
                descSize[size],
                descriptionClassName
              )}
            >
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
