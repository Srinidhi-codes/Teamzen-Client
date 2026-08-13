import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type ProfileSectionProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
};

export function ProfileSection({
  title,
  description,
  icon: Icon,
  children,
  className,
  action,
}: ProfileSectionProps) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-5 sm:p-6", className)}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h2 className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-foreground">
            {Icon && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
            )}
            {title}
          </h2>
          {description ? (
            <p className={cn("text-sm text-muted-foreground", Icon && "pl-[42px]")}>
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ProfileMetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-3 last:border-b-0 last:pb-0 first:pt-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}
