"use client";

interface BadgeProps {
  variant: "success" | "warning" | "danger" | "info" | "default";
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    danger: "bg-destructive/10 text-destructive border border-destructive/20",
    info: "bg-primary/10 text-primary border border-primary/20",
    default: "bg-muted text-muted-foreground border border-border",
  };

  return (
    <span
      className={`px-1.5 py-0.5 w-fit inline-flex items-center gap-1.5 text-[11px] font-medium capitalize rounded-md ${styles[variant]}`}
    >
      {children}
    </span>
  );

}

