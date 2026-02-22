import { FormSelect } from "@/components/common/FormSelect";

interface EditableSelectFieldProps {
    label: string;
    value: string;
    icon: string;
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
        <div className="p-4 rounded-[2rem] border border-border/20 hover:bg-muted/30 shadow-md transition-colors group bg-linear-to-r from-primary/10 via-primary/10">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                    <span className="text-2xl pt-1 opacity-80 group-hover:opacity-100 transition-opacity">{icon}</span>
                    <div className="flex-1 space-y-1">
                        <p className="text-xs font-bold text-premium-label uppercase tracking-widest opacity-70">
                            {label}
                        </p>
                        {editable ? (
                            <div className="mt-1">
                                <FormSelect
                                    value={value}
                                    onValueChange={onChange}
                                    options={options}
                                    className="bg-background/50 h-10 py-2"
                                />
                            </div>
                        ) : (
                            <p className="text-sm font-semibold text-foreground/90">
                                {displayValue}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
