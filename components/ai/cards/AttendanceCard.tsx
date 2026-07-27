
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
        <div className="group relative bg-card border border-border rounded-xl p-0 transition-all overflow-hidden w-full animate-in slide-in-from-bottom-4 duration-500">
            <Link href="/attendance" className="block p-5">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-[10px] font-medium text-primary/60">{action || "Attendance"}</p>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-md text-[8px] font-medium border flex items-center gap-1",
                                    isSuccess ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                                )}>
                                    <div className={cn("w-1 h-1 rounded-full", isSuccess ? "bg-emerald-500" : "bg-amber-500")} />
                                    {status}
                                </div>
                            </div>
                            <h4 className="font-semibold text-lg text-foreground flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                {office || "Standard Office"}
                            </h4>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end text-primary/60 mb-1">
                            <Clock className="w-3 h-3" />
                            <p className="text-[10px] font-medium">Recorded at</p>
                        </div>
                        <p className="font-semibold text-xl text-foreground leading-none tabular-nums">{time}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border relative">
                    <div className="space-y-1">
                        <p className="text-[9px] font-medium text-muted-foreground/60">Proximity</p>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                            <span className="w-1 h-3 bg-primary/20 rounded-full" />
                            {distance || "In Range"}
                        </p>
                    </div>
                    {hours && (
                        <div className="space-y-1 text-right">
                            <p className="text-[9px] font-medium text-muted-foreground/60">Hours</p>
                            <p className="text-sm font-semibold text-foreground">{hours} units</p>
                        </div>
                    )}
                    
                    <div className="absolute right-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <ArrowUpRight className="w-8 h-8 text-primary/10" />
                    </div>
                </div>
            </Link>
        </div>
    );
};
