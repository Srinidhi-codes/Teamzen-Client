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
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="text-7xl mb-6 drop-shadow-2xl animate-bounce-slow">{icon}</div>
      <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-8 max-w-sm font-medium leading-relaxed">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>

  );
}
