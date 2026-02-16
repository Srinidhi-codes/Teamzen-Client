"use client";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
}

export function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    error: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    info: "bg-primary/10 text-primary border-primary/20",
  };


  return (
    <div className={`border rounded-[1.25rem] p-5 mb-6 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300 ${styles[type]}`}>
      <div className="flex justify-between items-center gap-4">
        <span className="text-sm font-bold tracking-tight">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-blend-overlay hover:bg-black/5 transition-all text-xl leading-none"
          >
            ×
          </button>
        )}
      </div>
    </div>

  );
}
