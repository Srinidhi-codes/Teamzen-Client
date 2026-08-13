"use client"
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DatePickerSimple } from "@/components/ui/datePicker";
import { Eye, EyeOff } from "lucide-react";
import moment from "moment";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    editable: boolean;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    sensitive?: boolean;
    required?: boolean;
    placeholder?: string;
}

export function EditableField({
    label,
    value,
    icon,
    editable,
    onChange,
    error,
    type = "text",
    sensitive = false,
    required = false,
    placeholder,
}: EditableFieldProps) {
    const [showSensitive, setShowSensitive] = useState(false);

    const displayValue =
        sensitive && !showSensitive && value && value !== "Not provided"
            ? "••••••••••"
            : value || "Not provided";

    return (
        <div className="rounded-lg bg-muted/50 px-3.5 py-3">
            <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
                    {icon}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {label} {required && <span className="text-destructive">*</span>}
                    </p>
                    {editable ? (
                        type === "date" ? (
                            <DatePickerSimple
                                value={value}
                                onChange={(date) => onChange(date ? moment(date).format("YYYY-MM-DD") : "")}
                                error={error}
                                className="w-full"
                            />
                        ) : (
                            <Input
                                type={type}
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                error={error}
                                placeholder={placeholder}
                                className="h-9 bg-background"
                            />
                        )
                    ) : (
                        <p className={cn("truncate text-sm font-medium", value ? "text-foreground" : "text-muted-foreground")}>
                            {displayValue}
                        </p>
                    )}
                </div>
                {sensitive && value && value !== "Not provided" && !editable && (
                    <button
                        onClick={() => setShowSensitive(!showSensitive)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                        type="button"
                        aria-label={showSensitive ? "Hide value" : "Show value"}
                    >
                        {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                )}
            </div>
        </div>
    );
}
