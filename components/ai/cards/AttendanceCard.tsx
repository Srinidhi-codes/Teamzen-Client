
"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";

interface AttendanceCardProps {
    action: string;
    status: string;
    time: string;
    office?: string;
    distance?: string;
    hours?: string;
}

export const AttendanceCard = ({ action, status, time, office, distance, hours }: AttendanceCardProps) => {
    return (
        <div className="bg-linear-to-br from-primary/10 via-card to-card border-b border-border/50 rounded-3xl p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-300 w-full group/attendance">
            <Link href="/attendance">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover/attendance:scale-110 transition-transform">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">{action}</p>
                            <h4 className="font-black text-lg text-foreground tracking-tight italic uppercase">{office || "Standard Office"}</h4>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Timeline</p>
                        <p className="font-black text-xl text-primary leading-none">{time}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border mt-2">
                    {distance && (
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Proximity</p>
                            <p className="text-xs font-bold text-foreground">{distance}</p>
                        </div>
                    )}
                    {hours && (
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Logged Hours</p>
                            <p className="text-xs font-bold text-foreground">{hours} units</p>
                        </div>
                    )}
                    <div className="col-span-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-xs font-black text-foreground uppercase tracking-widest">{status}</p>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};
