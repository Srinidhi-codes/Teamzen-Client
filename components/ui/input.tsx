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
        <label className="text-sm font-medium text-muted-foreground px-0.5">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          data-slot="input"
          className={cn(
            "flex h-9 w-full rounded-md border bg-background px-3 py-2 text-sm font-medium transition-colors placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:cursor-not-allowed disabled:opacity-50",
            suffix ? "pr-12" : "",
            icon ? "pl-10" : "",
            error
              ? "border-destructive/50 focus:ring-destructive/10"
              : "border-border focus:ring-primary/10 hover:border-border",
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive pl-0.5">{error}</p>}
      {hint && <p className="text-xs text-muted-foreground pl-0.5">{hint}</p>}
    </div>
  )
}


export { Input }
