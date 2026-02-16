"use client";

import { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function FormInput({ label, error, hint, ...props }: FormInputProps) {
  return (
    <div>
      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 mb-2 block">
        {label}
        {props.required && <span className="text-destructive ml-1">*</span>}
      </label>

      <input
        {...props}
        className={`w-full px-5 py-4 bg-background border rounded-2xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300 ${error ? "border-destructive/50 ring-destructive/10" : "border-border focus:border-primary/50"
          }`}
      />
      {error && <p className="mt-2 text-[10px] font-black text-destructive uppercase tracking-widest ml-1">{error}</p>}
      {hint && <p className="mt-2 text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest ml-1">{hint}</p>}

    </div>
  );
}
