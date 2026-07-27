import { FormSelect } from "@/components/common/FormSelect";

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
        <div className="p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors group">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                    <span className="text-muted-foreground pt-1">{icon}</span>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
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
