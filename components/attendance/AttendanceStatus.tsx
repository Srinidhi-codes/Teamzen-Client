"use client";

import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  PartyPopper,
  Timer,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface AttendanceStatusProps {
  status: "present" | "absent" | "half_day" | "leave" | "holiday";
  loginTime?: string;
  logoutTime?: string;
  workedHours?: number;
}

export function AttendanceStatus({
  status,
  loginTime,
  logoutTime,
  workedHours,
}: AttendanceStatusProps) {
  const statusConfig = {
    present: { color: "emerald", icon: CheckCircle2, label: "On Duty" },
    absent: { color: "destructive", icon: XCircle, label: "Not Present" },
    half_day: { color: "amber", icon: Timer, label: "Half Shift" },
    leave: { color: "primary", icon: Calendar, label: "On Leave" },
    holiday: { color: "primary", icon: PartyPopper, label: "Holiday" },
  };

  const config = statusConfig[status];

  return (
    <div className="group bg-card/60 backdrop-blur-md rounded-3xl sm:rounded-4xl p-4 sm:p-6 border border-border shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-500 w-full lg:w-fit min-w-[280px]">
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 ${config.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
            config.color === 'destructive' ? 'bg-destructive/10 text-destructive' :
              config.color === 'amber' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                'bg-primary/10 text-primary'
            }`}
        >
          <config.icon className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div>
          <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Current Status</p>
          <p className={`text-base sm:text-lg font-black tracking-tight ${config.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
            config.color === 'destructive' ? 'text-destructive' :
              config.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                'text-primary'
            }`}>
            {config.label}
          </p>
        </div>
      </div>

      {(loginTime || logoutTime || workedHours) && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {loginTime && (
              <div className="bg-muted/30 p-3 rounded-xl border border-border flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3 text-emerald-500" />
                  Check In
                </span>
                <span className="text-xs font-black text-foreground">{loginTime}</span>
              </div>
            )}
            {logoutTime && (
              <div className="bg-muted/30 p-3 rounded-xl border border-border flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-destructive" />
                  Check Out
                </span>
                <span className="text-xs font-black text-foreground">{logoutTime}</span>
              </div>
            )}
          </div>

          {workedHours !== undefined && (
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Productive Time</span>
              </div>
              <span className="text-lg font-black text-primary tracking-tighter">
                {workedHours.toFixed(2)}<span className="text-[10px] uppercase ml-0.5 text-primary/70">hrs</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
