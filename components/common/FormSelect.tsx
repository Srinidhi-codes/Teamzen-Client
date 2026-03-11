"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
  icon?: ReactNode;
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
  icon
}: FormSelectProps) {
  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-premium-label px-1">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-muted-foreground group-focus-within:text-primary transition-colors">
            {icon}
          </div>
        )}
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger
            className={cn(
              "h-[45px] w-full bg-background border rounded-xl text-sm font-medium text-foreground transition-all duration-300 focus:ring-4 focus:ring-primary/10",
              icon ? "pl-11" : "px-5",
              error ? "border-destructive/50" : "border-border/50 focus:border-primary/50 hover:border-border",
              className
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          <SelectContent className="rounded-2xl border-border shadow-2xl animate-in zoom-in-95 duration-200 mt-18">
            {options
              ? options.map((option) => (
                <SelectItem key={option.value} value={option.value} className="rounded-xl focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer">
                  {option.label}
                </SelectItem>
              ))
              : children}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="mt-2 text-[10px] font-black text-destructive uppercase tracking-widest pl-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
    </div>
  );
}
