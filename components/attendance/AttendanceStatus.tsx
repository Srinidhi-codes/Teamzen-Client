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
  status: "present" | "absent" | "half_day" | "leave" | "holiday" | "late_login" | "early_logout";
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
    present: { color: "emerald", icon: CheckCircle2, label: "Present" },
    absent: { color: "destructive", icon: XCircle, label: "Absent" },
    half_day: { color: "amber", icon: Timer, label: "Half day" },
    late_login: { color: "amber", icon: Clock, label: "Late login" },
    early_logout: { color: "amber", icon: Clock, label: "Early logout" },
    leave: { color: "primary", icon: Calendar, label: "On leave" },
    holiday: { color: "primary", icon: PartyPopper, label: "Holiday" },
  };

  const config = statusConfig[status];

  return (
    <div className="group bg-card rounded-xl p-4 sm:p-6 border border-border w-full lg:w-fit min-w-[280px]">
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-transform duration-300 ${config.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
            config.color === 'destructive' ? 'bg-destructive/10 text-destructive' :
              config.color === 'amber' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                'bg-primary/10 text-primary'
            }`}
        >
          <config.icon className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground leading-none mb-1">Status</p>
          <p className={`text-base sm:text-lg font-semibold tracking-tight ${config.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
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
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3 text-emerald-500" />
                  Check in
                </span>
                <span className="text-sm font-semibold text-foreground">{loginTime}</span>
              </div>
            )}
            {logoutTime && (
              <div className="bg-muted/30 p-3 rounded-xl border border-border flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-destructive" />
                  Check out
                </span>
                <span className="text-sm font-semibold text-foreground">{logoutTime}</span>
              </div>
            )}
          </div>

          {workedHours !== undefined && (
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Hours worked</span>
              </div>
              <span className="text-lg font-semibold text-primary tracking-tight tabular-nums">
                {workedHours.toFixed(2)}<span className="text-xs ml-0.5 text-primary/70">hrs</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
