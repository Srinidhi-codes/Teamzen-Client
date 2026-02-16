"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import moment from "moment"
import { CalendarIcon } from "lucide-react"

interface DatePickerSimpleProps {
    label?: string
    value?: string | Date
    onChange?: (date: Date | undefined) => void
    error?: string
    required?: boolean
    className?: string
}

export function DatePickerSimple({ label, value, onChange, error, required, className }: DatePickerSimpleProps) {
    const [open, setOpen] = React.useState(false)

    const dateValue = value ? (typeof value === 'string' ? moment(value.substring(0, 10), "YYYY-MM-DD").toDate() : value) : undefined;
    // Check if date is valid
    const isValidDate = dateValue instanceof Date && !isNaN(dateValue.getTime());
    const displayDate = isValidDate ? dateValue : undefined;

    return (
        <div className={cn("flex flex-col space-y-2", className)}>
            {label && (
                <label className="text-premium-label px-1">
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full h-[35px] rounded-2xl bg-muted/5 border-border/50 text-left font-medium px-5 shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.08)] hover:bg-muted/20 transition-all duration-300 focus:ring-4 focus:ring-primary/10",
                            !displayDate && "text-muted-foreground/50",
                            error && "border-destructive/50 focus:ring-destructive/10"
                        )}


                    >
                        {displayDate ? (
                            moment(displayDate).format("MMM DD, YYYY")
                        ) : (
                            <span>Select Date</span>
                        )}
                        <CalendarIcon className={cn("ml-auto h-5 w-5 opacity-40 transition-colors", open && "text-primary opacity-100")} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-3xl border-border animate-in zoom-in-95 duration-300" align="start">
                    <Calendar
                        mode="single"
                        selected={displayDate}
                        onSelect={(date) => {
                            onChange?.(date)
                            setOpen(false)
                        }}
                        disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        captionLayout="dropdown"
                        fromYear={1960}
                        toYear={new Date().getFullYear()}
                    />
                </PopoverContent>
            </Popover>
            {error && <p className="text-[10px] font-black text-destructive uppercase tracking-widest pl-1 animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
    )
}

