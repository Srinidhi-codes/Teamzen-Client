
"use client";

import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaveTypeCardProps {
    id: string;
    name: string;
    description: string;
    availability: string;
    onSelect: (name: string, id: string) => void;
}

export const LeaveTypeCard = ({ id, name, description, availability, onSelect }: LeaveTypeCardProps) => {
    const isRecommended = availability?.toLowerCase().includes('recommended') || availability?.toLowerCase().includes('good');

    return (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 animate-in zoom-in-95 duration-500 w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Leave type</p>
                        <h4 className="font-semibold text-lg text-foreground">{name}</h4>
                    </div>
                </div>
                {availability && (
                    <div className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-medium border",
                        isRecommended ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-muted border-border text-muted-foreground"
                    )}>
                        {availability}
                    </div>
                )}
            </div>
            <p className="text-[13px] font-medium text-foreground/70 leading-relaxed">
                {description}
            </p>
            <button
                onClick={() => onSelect(name, id)}
                className="w-full py-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            >
                Apply
            </button>
        </div>
    );
};
