import { FormSelect } from "@/components/common/FormSelect";
import { cn } from "@/lib/utils";

interface EditableSelectFieldProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    editable: boolean;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}

export function EditableSelectField({
    label,
    value,
    icon,
    editable,
    onChange,
    options,
}: EditableSelectFieldProps) {
    const displayValue =
        options.find((opt) => opt.value === value)?.label || "Not specified";

    return (
        <div className="rounded-lg bg-muted/50 px-3.5 py-3">
            <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
                    {icon}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                    </p>
                    {editable ? (
                        <FormSelect
                            value={value}
                            onValueChange={onChange}
                            options={options}
                            className="h-9 bg-background py-1.5"
                        />
                    ) : (
                        <p className={cn("truncate text-sm font-medium", value ? "text-foreground" : "text-muted-foreground")}>
                            {displayValue}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
