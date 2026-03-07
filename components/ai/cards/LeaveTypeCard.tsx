
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
        <div className="bg-linear-to-br from-primary/10 via-card to-card border-b border-border/50 rounded-3xl p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-500 w-full group/leave">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover/leave:rotate-12 transition-all">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Application Protocol</p>
                        <h4 className="font-black text-lg text-foreground tracking-tight italic uppercase">{name}</h4>
                    </div>
                </div>
                {availability && (
                    <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg",
                        isRecommended ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 shadow-emerald-500/5" : "bg-muted border-border text-muted-foreground"
                    )}>
                        {availability}
                    </div>
                )}
            </div>
            <p className="text-[13px] font-medium text-foreground/70 leading-relaxed italic">
                {description}
            </p>
            <button
                onClick={() => onSelect(name, id)}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
            >
                Initialize Request
            </button>
        </div>
    );
};
