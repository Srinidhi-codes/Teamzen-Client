"use client";

import { TextareaHTMLAttributes } from "react";

interface FormTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function FormTextarea({
  label,
  error,
  hint,
  ...props
}: FormTextareaProps) {
  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground mb-2 block">
        {label}
        {props.required && <span className="text-destructive ml-1">*</span>}
      </label>

      <textarea
        {...props}
        className={`w-full px-5 py-4 bg-background border rounded-2xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 resize-none ${error ? "border-destructive/50 ring-destructive/10" : "border-border focus:border-primary/50"
          }`}
      />
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      {hint && <p className="mt-2 text-sm text-muted-foreground">{hint}</p>}

    </div>
  );
}
