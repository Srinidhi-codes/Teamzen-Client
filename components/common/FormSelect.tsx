"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReactNode } from "react";

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options?: Option[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  children?: ReactNode;
  className?: string;
}

export function FormSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  error,
  required,
  children,
  className,
}: FormSelectProps) {
  return (
    <div>
      {label && (
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 mb-2 block">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={`h-auto px-5 py-4 w-full bg-background border rounded-2xl text-sm font-medium text-foreground transition-all duration-300 focus:ring-4 focus:ring-primary/10 ${error ? "border-destructive/50" : "border-border focus:border-primary/50"} ${className}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className="rounded-2xl border-border shadow-2xl animate-in zoom-in-95 duration-200">
          {options
            ? options.map((option) => (
              <SelectItem key={option.value} value={option.value} className="rounded-xl focus:bg-primary/10 focus:text-primary transition-colors">
                {option.label}
              </SelectItem>
            ))
            : children}
        </SelectContent>
      </Select>
      {error && <p className="mt-2 text-[10px] font-black text-destructive uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>

  );
}
