"use client"
import { useState } from "react";

interface EditableFieldProps {
    label: string;
    value: string;
    icon: string;
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
        <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                    <span className="text-2xl text-black">{icon}</span>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-600 mb-1">
                            {label} {required && <span className="text-red-500">*</span>}
                        </p>
                        {editable ? (
                            <div>
                                <input
                                    type={type}
                                    value={value}
                                    onChange={(e) => onChange(e.target.value)}
                                    className={`w-full text-sm p-2 border rounded-md text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
                                        }`}
                                    placeholder={placeholder}
                                    required={required}
                                />
                                {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
                            </div>
                        ) : (
                            <p className="text-base font-medium text-gray-900">
                                {displayValue}
                            </p>
                        )}
                    </div>
                </div>
                {sensitive && value && value !== "Not provided" && !editable && (
                    <button
                        onClick={() => setShowSensitive(!showSensitive)}
                        className="text-gray-400 hover:text-gray-600 transition ml-2"
                        type="button"
                    >
                        {showSensitive ? (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
