"use client";

import { useState, useMemo } from "react";
import moment from "moment";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X, CalendarDays, Users, Building2, User } from "lucide-react";
import Image from "next/image";

interface MyLeave {
  id: string;
  fromDate: string;
  toDate: string;
  status: string;
  leaveType: { id: string; name: string };
  durationDays: number;
}

interface TeamLeave {
  id: string;
  fromDate: string;
  toDate: string;
  status: string;
  durationDays: number;
  leaveType: { id: string; name: string, code: string };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: { url: string };
  };
}

interface Holiday {
  id: string;
  name: string;
  holidayDate: string;
  isOptional: boolean;
  description: string;
}

interface LeaveCalendarProps {
  myLeaves: MyLeave[];
  teamLeaves: TeamLeave[];
  holidays: Holiday[];
}

type FilterType = "all" | "my" | "team" | "holiday";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function isBetween(date: moment.Moment, from: string, to: string) {
  return date.isSameOrAfter(moment(from), "day") && date.isSameOrBefore(moment(to), "day");
}

export function LeaveCalendar({ myLeaves, teamLeaves, holidays }: LeaveCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(moment().startOf("month"));
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedDay, setSelectedDay] = useState<moment.Moment | null>(null);

  const prevMonth = () => setCurrentMonth((m) => m.clone().subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.clone().add(1, "month"));
  const goToday = () => { setCurrentMonth(moment().startOf("month")); setSelectedDay(moment()); };

  const calendarDays = useMemo(() => {
    const startOfGrid = currentMonth.clone().startOf("isoWeek");
    const endOfGrid = currentMonth.clone().endOf("month").endOf("isoWeek");
    const days: moment.Moment[] = [];
    let cur = startOfGrid.clone();
    while (cur.isSameOrBefore(endOfGrid)) {
      days.push(cur.clone());
      cur.add(1, "day");
    }
    return days;
  }, [currentMonth]);

  const getEventsForDay = (day: moment.Moment) => {
    const myLeaveEvents = (filter === "all" || filter === "my")
      ? myLeaves.filter((l) => isBetween(day, l.fromDate, l.toDate))
      : [];

    const teamLeaveEvents = (filter === "all" || filter === "team")
      ? teamLeaves.filter((l) => isBetween(day, l.fromDate, l.toDate))
      : [];

    const holidayEvents = (filter === "all" || filter === "holiday")
      ? holidays.filter((h) => day.isSame(moment(h.holidayDate), "day"))
      : [];

    return { myLeaveEvents, teamLeaveEvents, holidayEvents };
  };

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : null;

  const filters: { key: FilterType; label: string; icon: any; color: string }[] = [
    { key: "all", label: "All", icon: CalendarDays, color: "text-primary" },
    { key: "my", label: "My leave", icon: User, color: "text-rose-500" },
    { key: "team", label: "Team", icon: Users, color: "text-emerald-500" },
    { key: "holiday", label: "Holidays", icon: Building2, color: "text-blue-500" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">

      <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden">

        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <h2 className="text-lg font-semibold text-foreground whitespace-nowrap">
              {currentMonth.format("MMMM")}{" "}
              <span className="text-muted-foreground">{currentMonth.format("YYYY")}</span>
            </h2>
            <button
              onClick={goToday}
              className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
            >
              Today
            </button>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
            <div className="flex items-center bg-muted/40 p-1 rounded-lg border border-border gap-0.5 overflow-x-auto no-scrollbar">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                    filter === f.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <f.icon className={cn("w-3 h-3", filter === f.key ? f.color : "")} />
                  <span className="hidden xs:inline sm:inline">{f.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2.5 text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 divide-x divide-y divide-border">
          {calendarDays.map((day, i) => {
            const isCurrentMonth = day.month() === currentMonth.month();
            const isToday = day.isSame(moment(), "day");
            const isSelected = selectedDay && day.isSame(selectedDay, "day");
            const { myLeaveEvents, teamLeaveEvents, holidayEvents } = getEventsForDay(day);
            const totalEvents = myLeaveEvents.length + teamLeaveEvents.length + holidayEvents.length;

            return (
              <div
                key={i}
                onClick={() => setSelectedDay(isSelected ? null : day.clone())}
                className={cn(
                  "min-h-[70px] sm:min-h-[110px] p-1 sm:p-2 cursor-pointer transition-colors relative",
                  !isCurrentMonth && "bg-muted/20",
                  isSelected && "bg-primary/5 ring-2 ring-inset ring-primary/30",
                  !isSelected && "hover:bg-muted/30",
                  isToday && !isSelected && "bg-primary/5"
                )}
              >
                <div className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium mb-1",
                  isToday ? "bg-primary text-primary-foreground" : "",
                  !isToday && !isCurrentMonth ? "text-muted-foreground/40" : "",
                  !isToday && isCurrentMonth ? "text-foreground" : "",
                )}>
                  {day.date()}
                </div>

                {holidayEvents.slice(0, 1).map((h) => (
                  <div
                    key={h.id}
                    className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 truncate mb-0.5 border border-blue-500/20"
                    title={h.name}
                  >
                    {h.name}
                  </div>
                ))}

                {myLeaveEvents.slice(0, holidayEvents.length > 0 ? 1 : 2).filter((l) => l.status !== "cancelled").map((l) => (
                  <div
                    key={l.id}
                    className={cn(
                      "text-[11px] font-medium px-1.5 py-0.5 rounded-md truncate mb-0.5 border",
                      l.status === "approved"
                        ? "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20"
                        : "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20"
                    )}
                    title={`${l.leaveType.name} (${l.status})`}
                  >
                    {l.leaveType.name}
                  </div>
                ))}

                {teamLeaveEvents.length > 0 && (
                  <div className="space-y-0.5">
                    {teamLeaveEvents.slice(0, 2).filter((l) => l.status !== "cancelled").map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/20 truncate"
                        title={`${l.user.firstName} ${l.user.lastName} — ${l.leaveType.name}`}
                      >
                        <span className="shrink-0 w-3.5 h-3.5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[7px] font-medium">
                          {l.user.firstName.charAt(0)}
                        </span>
                        <span className="truncate">{l.user.firstName}</span>
                      </div>
                    ))}
                    {teamLeaveEvents.length > 2 && (
                      <div className="text-[11px] font-medium text-muted-foreground px-1.5">
                        +{teamLeaveEvents.length - 2} more
                      </div>
                    )}
                  </div>
                )}

                {totalEvents > 3 && (
                  <div className="text-[11px] font-medium text-muted-foreground mt-0.5">
                    +{totalEvents - 3} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={cn(
        "lg:w-80 bg-card border border-border rounded-xl overflow-hidden transition-opacity",
        selectedDay ? "opacity-100" : "opacity-60"
      )}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {selectedDay ? selectedDay.format("dddd") : "Select a day"}
            </p>
            <h3 className="text-lg font-semibold text-foreground">
              {selectedDay ? selectedDay.format("MMM DD, YYYY") : "—"}
            </h3>
          </div>
          {selectedDay && (
            <button
              onClick={() => setSelectedDay(null)}
              className="p-1.5 hover:bg-muted/50 rounded-md transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-4 space-y-3 overflow-y-auto max-h-[500px] no-scrollbar">
          {!selectedDay && (
            <div className="py-12 text-center space-y-3">
              <CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">Click a day to see events</p>
            </div>
          )}

          {selectedDay && selectedDayEvents && (
            <>
              {selectedDayEvents.holidayEvents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-blue-600 flex items-center gap-1.5">
                    <Building2 className="w-3 h-3" /> Company holiday
                  </p>
                  {selectedDayEvents.holidayEvents.map((h) => (
                    <div key={h.id} className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                      <p className="text-sm font-medium text-foreground">{h.name}</p>
                      {h.isOptional && (
                        <span className="inline-block rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize text-blue-600 bg-blue-500/10 border border-blue-500/20">
                          Optional
                        </span>
                      )}
                      {h.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{h.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedDayEvents.myLeaveEvents.length > 0 && selectedDayEvents.myLeaveEvents.filter((l) => l.status !== "cancelled").length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-rose-600 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> My leave
                  </p>
                  {selectedDayEvents.myLeaveEvents.filter((l) => l.status !== "cancelled").map((l) => (
                    <div key={l.id} className="p-3 rounded-xl border border-green-500/20 bg-green-500/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{l.leaveType.name}</p>
                        <span className={cn(
                          "rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize",
                          l.status === "approved" ? "bg-emerald-500/20 text-emerald-600" : "bg-orange-500/20 text-orange-600"
                        )}>
                          {l.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {moment(l.fromDate).format("MMM DD")} → {moment(l.toDate).format("MMM DD")} · {Number(l.durationDays).toFixed(0)} day(s)
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {selectedDayEvents.teamLeaveEvents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-purple-600 flex items-center gap-1.5">
                    <Users className="w-3 h-3" /> Team on leave ({selectedDayEvents.teamLeaveEvents.length})
                  </p>
                  {selectedDayEvents.teamLeaveEvents.filter((l) => l.status !== "cancelled").map((l) => (
                    <div key={l.id} className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                        {l.user.profilePicture?.url ? (
                          <Image src={l.user.profilePicture.url} alt={l.user.firstName} width={32} height={32} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-primary font-medium text-xs">
                            {l.user.firstName.charAt(0)}{l.user.lastName?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {l.user.firstName} {l.user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{l.leaveType.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedDayEvents.holidayEvents.length === 0 &&
                selectedDayEvents.myLeaveEvents.length === 0 &&
                selectedDayEvents.teamLeaveEvents.length === 0 && (
                  <div className="py-10 text-center space-y-2">
                    <CalendarDays className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-sm text-muted-foreground">No events on this day</p>
                  </div>
                )}
            </>
          )}
        </div>

        <div className="px-5 py-3 border-t border-border bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground mb-2">Legend</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">My approved leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-400" />
              <span className="text-xs text-muted-foreground">My pending leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-xs text-muted-foreground">Team member on leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-xs text-muted-foreground">Company holiday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
