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
        <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-start space-x-3">
                <span className="text-2xl">{icon}</span>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
                    {editable ? (
                        <select
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full text-sm p-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        >
                            {options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <p className="text-base font-medium text-gray-900">
                            {displayValue}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
