"use client";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>

  );
}
