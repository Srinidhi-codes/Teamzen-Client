import * as React from "react"

import { cn } from "@/lib/utils"

interface CustomInputProps extends React.ComponentProps<"input"> {
    label?: string;
    required?: boolean;
}

function Input({ className, type, ...props }: CustomInputProps) {
    return (
        <>
            <div className="flex flex-col gap-y-1">
                {props.label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {props.label}
                        {props.required && <span className="text-red-600">*</span>}
                    </label>
                )}
                <input
                    type={type}
                    data-slot="input"
                    className={cn(
                        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                        className
                    )}
                    {...props}
                />
            </div>
        </>
    )
}

export { Input }
