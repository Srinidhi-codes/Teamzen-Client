"use client"
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DatePickerSimple } from "@/components/ui/datePicker";
import { Eye, EyeOff } from "lucide-react";
import moment from "moment";

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
        <div className="p-4 rounded-4xl border border-border/20 hover:bg-muted/30 shadow-md transition-colors group bg-linear-to-r from-primary/10 via-primary/10">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                    <span className="text-2xl pt-1 opacity-80 group-hover:opacity-100 transition-opacity">{icon}</span>
                    <div className="flex-1 space-y-1">
                        <p className="text-xs font-bold text-premium-label uppercase tracking-widest opacity-70">
                            {label} {required && <span className="text-destructive ml-0.5">*</span>}
                        </p>
                        {editable ? (
                            <div>
                                {type === "date" ? (
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
                                        className="h-10 bg-background/50"
                                    />
                                )}
                            </div>
                        ) : (
                            <p className="text-sm font-semibold text-foreground/90">
                                {displayValue}
                            </p>
                        )}
                    </div>
                </div>
                {sensitive && value && value !== "Not provided" && !editable && (
                    <button
                        onClick={() => setShowSensitive(!showSensitive)}
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                        type="button"
                    >
                        {showSensitive ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
