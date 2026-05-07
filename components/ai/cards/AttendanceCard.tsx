
"use client";

import { Building2, MapPin, Clock, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AttendanceCardProps {
    action: string;
    status: string;
    time: string;
    office?: string;
    distance?: string;
    hours?: string;
}

export const AttendanceCard = ({ action, status, time, office, distance, hours }: AttendanceCardProps) => {
    const isSuccess = status.toLowerCase() === 'present' || status.toLowerCase().includes('success') || status.toLowerCase().includes('in');

    return (
        <div className="group relative bg-card border border-border/50 rounded-4xl p-0 transition-all overflow-hidden w-full animate-in slide-in-from-bottom-4 duration-700">
            <Link href="/attendance" className="block p-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary transition-transform duration-500 group-hover:scale-110">
                            <Building2 className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{action}</p>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-1",
                                    isSuccess ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                                )}>
                                    <div className={cn("w-1 h-1 rounded-full animate-pulse", isSuccess ? "bg-emerald-500" : "bg-amber-500")} />
                                    {status}
                                </div>
                            </div>
                            <h4 className="font-black text-xl text-foreground tracking-tighter uppercase italic flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                {office || "Standard Office"}
                            </h4>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end text-primary/60 mb-1">
                            <Clock className="w-3 h-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Recorded At</p>
                        </div>
                        <p className="font-black text-2xl text-foreground leading-none tabular-nums">{time}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/40 relative">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Proximity</p>
                        <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                            <span className="w-1 h-3 bg-primary/20 rounded-full" />
                            {distance || "In Range"}
                        </p>
                    </div>
                    {hours && (
                        <div className="space-y-1 text-right">
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Session Hours</p>
                            <p className="text-sm font-bold text-foreground">{hours} units</p>
                        </div>
                    )}
                    
                    <div className="absolute right-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <ArrowUpRight className="w-10 h-10 text-primary/10" />
                    </div>
                </div>
            </Link>
        </div>
    );
};
