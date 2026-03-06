import * as React from "react"

import { cn } from "@/lib/utils"

interface CustomInputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: React.ReactNode;
  icon?: React.ReactNode;
}

function Input({ className, type, label, error, hint, suffix, icon, ...props }: CustomInputProps) {
  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-premium-label px-1">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          data-slot="input"
          className={cn(
            "flex h-[45px] w-full rounded-xl border bg-background px-5 py-2 text-sm font-medium shadow-inner transition-all placeholder:text-muted-foreground/50 focus:ring-4 focus:ring-primary/40 focus:border-primary outline-none disabled:cursor-not-allowed disabled:opacity-50",
            suffix ? "pr-14" : "",
            icon ? "pl-11" : "",
            error
              ? "border-destructive/50 focus:ring-destructive/10"
              : "border-border/50 focus:ring-primary/10 hover:border-border",
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="text-[10px] font-black text-destructive uppercase tracking-widest pl-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
      {hint && <p className="text-[10px] font-medium text-muted-foreground pl-1 opacity-60">{hint}</p>}
    </div>
  )
}


export { Input }
