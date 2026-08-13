"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import moment from "moment";
import { useQuery } from "@apollo/client/react";
import { GET_TEAM_HIERARCHY } from "@/lib/graphql/users/queries";
import { useGraphQLTeamLeaves, useGraphQLLeaveRequests } from "@/lib/graphql/leaves/leavesHook";
import { useGraphQLTeamAttendanceToday } from "@/lib/graphql/attendance/attendanceHooks";
import { PageHeader } from "@/components/common/PageHeader";
import { PhotoOverlay } from "@/components/common/PhotoOverlay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common/EmptyState";
import { EmptyImages } from "@/lib/brand-images";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  GitBranch,
  LayoutGrid,
  List,
  Search,
  Users,
  UserRound,
  UserX,
} from "lucide-react";

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string | null;
  designation?: { name: string } | null;
  department?: { name: string } | null;
};

type ViewMode = "directory" | "org" | "tree";

function memberName(m: Member) {
  return `${m.firstName} ${m.lastName}`.trim();
}

function initials(m: Member) {
  return `${m.firstName?.[0] || ""}${m.lastName?.[0] || ""}`.toUpperCase() || "?";
}

function matchesQuery(m: Member, q: string) {
  if (!q) return true;
  const hay = [
    m.firstName,
    m.lastName,
    m.designation?.name,
    m.department?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q.toLowerCase());
}

function MemberRow({
  member,
  label,
  highlight,
  onClick,
  onViewPhoto,
}: {
  member: Member;
  label?: string;
  highlight?: boolean;
  onClick?: () => void;
  onViewPhoto?: (member: Member) => void;
}) {
  const interactive = Boolean(onClick);

  const content = (
    <>
      <Avatar
        className={cn("h-10 w-10 rounded-lg", member.profilePictureUrl && "cursor-zoom-in")}
        onClick={(e) => {
          if (!member.profilePictureUrl || !onViewPhoto) return;
          e.stopPropagation();
          onViewPhoto(member);
        }}
      >
        <AvatarImage src={member.profilePictureUrl || undefined} className="object-cover" />
        <AvatarFallback className="rounded-lg bg-primary/10 text-sm font-semibold text-primary">
          {initials(member)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{memberName(member)}</p>
          {label && (
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                highlight
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {label}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {member.designation?.name || "Team member"}
          {member.department?.name ? ` · ${member.department.name}` : ""}
        </p>
      </div>

      {interactive && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />}
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
          highlight
            ? "border-primary/25 bg-primary/5"
            : "border-border bg-card hover:bg-muted/40"
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5",
        highlight ? "border-primary/25 bg-primary/5" : "border-border bg-card"
      )}
    >
      {content}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2.5 px-0.5">
      <span className="h-4 w-1 rounded-full bg-primary" aria-hidden />
      <h3 className="text-sm font-semibold tracking-tight text-foreground">{children}</h3>
    </div>
  );
}

function TreeNode({
  member,
  label,
  highlight,
  expanded,
  onClick,
  onViewPhoto,
}: {
  member: Member;
  label?: string;
  highlight?: boolean;
  expanded?: boolean;
  onClick?: () => void;
  onViewPhoto?: (member: Member) => void;
}) {
  const className = cn(
    "flex shrink-0 flex-col items-center rounded-xl border bg-card text-center transition-all duration-500 ease-out",
    expanded ? "w-44 p-4 sm:w-48" : "w-[9.5rem] p-3 sm:w-40",
    highlight
      ? "border-primary/30 bg-primary/5 ring-1 ring-primary/15"
      : "border-border",
    onClick && "cursor-pointer hover:border-primary/40 hover:bg-muted/30"
  );

  const body = (
    <>
      <Avatar
        className={cn(
          "rounded-xl transition-all duration-500",
          expanded ? "h-14 w-14 sm:h-16 sm:w-16" : "h-12 w-12",
          member.profilePictureUrl && "cursor-zoom-in"
        )}
        onClick={(e) => {
          if (!member.profilePictureUrl || !onViewPhoto) return;
          e.stopPropagation();
          onViewPhoto(member);
        }}
      >
        <AvatarImage src={member.profilePictureUrl || undefined} className="object-cover" />
        <AvatarFallback className="rounded-xl bg-primary/10 text-sm font-semibold text-primary">
          {initials(member)}
        </AvatarFallback>
      </Avatar>
      {label && (
        <span
          className={cn(
            "mt-2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          {label}
        </span>
      )}
      <p className="mt-1.5 w-full truncate text-sm font-semibold text-foreground sm:text-base">
        {memberName(member)}
      </p>
      <p className="mt-0.5 line-clamp-2 w-full text-[11px] leading-snug text-muted-foreground sm:text-xs">
        {member.designation?.name || "Team member"}
      </p>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {body}
      </button>
    );
  }

  return <div className={className}>{body}</div>;
}

function HierarchyTree({
  manager,
  user,
  peers,
  subordinates,
  focusedUserId,
  query,
  expanded,
  onFocus,
  onViewPhoto,
}: {
  manager: Member | null;
  user: Member | null;
  peers: Member[];
  subordinates: Member[];
  focusedUserId: string | null;
  query: string;
  expanded?: boolean;
  onFocus: (id: string) => void;
  onViewPhoto?: (member: Member) => void;
}) {
  const managerVisible = manager && matchesQuery(manager, query);
  const userVisible = user && matchesQuery(user, query);
  const visiblePeers = peers.filter((p) => matchesQuery(p, query));
  const visibleSubs = subordinates.filter((s) => matchesQuery(s, query));
  const midRow = [
    ...visiblePeers.map((p) => ({ member: p, label: "Peer" as const, highlight: false })),
    ...(userVisible && user
      ? [
          {
            member: user,
            label: focusedUserId ? "Selected" : "You",
            highlight: true,
          },
        ]
      : []),
  ];

  const hasAnything =
    Boolean(managerVisible) || midRow.length > 0 || visibleSubs.length > 0;

  if (!hasAnything) {
    return <EmptyPeople query={query} />;
  }

  return (
    <div
      className={cn(
        "w-full overflow-x-auto transition-all duration-500 ease-out",
        expanded ? "min-h-[min(70vh,40rem)] py-6" : "pb-2"
      )}
    >
      <div
        className={cn(
          "mx-auto flex min-w-min flex-col items-center px-2 transition-all duration-500",
          expanded ? "gap-1 py-6" : "py-4"
        )}
      >
        {managerVisible && manager && (
          <>
            <TreeNode
              member={manager}
              label="Manager"
              expanded={expanded}
              onClick={() => onFocus(manager.id)}
              onViewPhoto={onViewPhoto}
            />
            {(midRow.length > 0 || visibleSubs.length > 0) && (
              <div
                className={cn(
                  "w-px bg-border transition-all duration-500",
                  expanded ? "h-8" : "h-6"
                )}
                aria-hidden
              />
            )}
          </>
        )}

        {midRow.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap justify-center transition-all duration-500",
              expanded ? "gap-4 sm:gap-6" : "gap-3 sm:gap-4"
            )}
          >
            {midRow.map(({ member, label, highlight }) => (
              <TreeNode
                key={`${label}-${member.id}`}
                member={member}
                label={label}
                highlight={highlight}
                expanded={expanded}
                onClick={highlight ? undefined : () => onFocus(member.id)}
                onViewPhoto={onViewPhoto}
              />
            ))}
          </div>
        )}

        {visibleSubs.length > 0 && (
          <>
            <div className="flex w-full max-w-4xl flex-col items-center" aria-hidden>
              <div
                className={cn(
                  "w-px bg-border transition-all duration-500",
                  expanded ? "h-8" : "h-6"
                )}
              />
              {visibleSubs.length > 1 && (
                <div
                  className={cn(
                    "h-px bg-border transition-all duration-500",
                    expanded ? "w-[min(100%,48rem)]" : "w-[min(100%,36rem)]"
                  )}
                />
              )}
            </div>
            <div
              className={cn(
                "flex flex-wrap justify-center transition-all duration-500",
                expanded ? "gap-4 sm:gap-6" : "gap-3 sm:gap-4"
              )}
            >
              {visibleSubs.map((sub) => (
                <div key={sub.id} className="flex flex-col items-center">
                  {visibleSubs.length > 1 && (
                    <div
                      className={cn(
                        "w-px bg-border transition-all duration-500",
                        expanded ? "h-5" : "h-4"
                      )}
                      aria-hidden
                    />
                  )}
                  <TreeNode
                    member={sub}
                    label="Report"
                    expanded={expanded}
                    onClick={() => onFocus(sub.id)}
                    onViewPhoto={onViewPhoto}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {!manager && !focusedUserId && (
          <p className="mt-5 text-center text-xs text-muted-foreground">
            You are at the top of this reporting tree.
          </p>
        )}
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [focusedUserId, setFocusedUserId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("directory");
  const [query, setQuery] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<{ src: string; name: string } | null>(null);

  const { data, loading, error } = useQuery(GET_TEAM_HIERARCHY, {
    variables: { userId: focusedUserId },
    notifyOnNetworkStatusChange: true,
  });

  const { teamLeavesData, isLoading: leavesLoading } = useGraphQLTeamLeaves();
  const { leaveRequestData: pendingApprovals } = useGraphQLLeaveRequests(true);
  const {
    teamAttendanceToday,
    isLoading: attendanceLoading,
  } = useGraphQLTeamAttendanceToday();

  const hierarchy = (data as any)?.teamHierarchy;
  const manager: Member | null = hierarchy?.manager || null;
  const user: Member | null = hierarchy?.user || null;
  const peers: Member[] = hierarchy?.peers || [];
  const subordinates: Member[] = hierarchy?.subordinates || [];

  const presentToday = useMemo(
    () => teamAttendanceToday.filter((item) => item.status === "present"),
    [teamAttendanceToday]
  );
  const absentToday = useMemo(
    () => teamAttendanceToday.filter((item) => item.status === "absent"),
    [teamAttendanceToday]
  );
  const leaveToday = useMemo(
    () => teamAttendanceToday.filter((item) => item.status === "leave"),
    [teamAttendanceToday]
  );

  const circleIds = useMemo(() => {
    const ids = new Set<string>();
    if (user?.id) ids.add(user.id);
    peers.forEach((p) => ids.add(p.id));
    subordinates.forEach((s) => ids.add(s.id));
    if (manager?.id) ids.add(manager.id);
    return ids;
  }, [user, peers, subordinates, manager]);

  const awayNow = useMemo(() => {
    const today = moment().startOf("day");
    return (teamLeavesData || []).filter((leave: any) => {
      if (!["approved", "pending"].includes((leave.status || "").toLowerCase())) return false;
      const from = moment(leave.fromDate).startOf("day");
      const to = moment(leave.toDate).startOf("day");
      const overlaps =
        today.isSameOrAfter(from) && today.isSameOrBefore(to);
      const upcoming = from.isAfter(today) && from.diff(today, "days") <= 14;
      return overlaps || upcoming;
    });
  }, [teamLeavesData]);

  const awayToday = awayNow.filter((leave: any) => {
    const today = moment().startOf("day");
    return (
      today.isSameOrAfter(moment(leave.fromDate).startOf("day")) &&
      today.isSameOrBefore(moment(leave.toDate).startOf("day"))
    );
  });

  const directoryPeople = useMemo(() => {
    const list: { member: Member; label: string; highlight?: boolean }[] = [];
    if (manager) list.push({ member: manager, label: "Manager" });
    if (user) {
      list.push({
        member: user,
        label: focusedUserId ? "Selected" : "You",
        highlight: true,
      });
    }
    peers.forEach((p) => list.push({ member: p, label: "Peer" }));
    subordinates.forEach((s) => list.push({ member: s, label: "Report" }));
    return list.filter((item) => matchesQuery(item.member, query));
  }, [manager, user, peers, subordinates, focusedUserId, query]);

  const filteredPeers = peers.filter((p) => matchesQuery(p, query));
  const filteredSubs = subordinates.filter((s) => matchesQuery(s, query));
  const managerVisible = manager && matchesQuery(manager, query);
  const userVisible = user && matchesQuery(user, query);

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto my-12 max-w-lg rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <p className="text-sm font-semibold text-destructive">Failed to load team</p>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          type="button"
          onClick={() => setFocusedUserId(null)}
          className="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    );
  }

  const pageTitle =
    focusedUserId && user ? `${user.firstName}'s team` : "Team";
  const pendingCount = pendingApprovals?.filter(
    (r: any) => (r.status || "").toLowerCase() === "pending"
  ).length;
  const handleViewMemberPhoto = (member: Member) => {
    if (!member.profilePictureUrl) return;
    setSelectedPhoto({
      src: member.profilePictureUrl,
      name: memberName(member),
    });
  };

  return (
    <div className="w-full space-y-6 pb-10">
      <PageHeader
        eyebrow="People"
        title={pageTitle}
        description="Your reporting circle, who’s in today, and who’s away."
        actions={
          <div className="flex items-center gap-4 rounded-xl border border-border bg-background/70 px-4 py-3">
            <div className="text-center">
              <p className="text-[11px] font-medium text-muted-foreground">Present</p>
              <p className="text-xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {presentToday.length}
              </p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-[11px] font-medium text-muted-foreground">Absent</p>
              <p className="text-xl font-semibold tabular-nums text-red-600 dark:text-red-400">
                {absentToday.length}
              </p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-[11px] font-medium text-muted-foreground">Out today</p>
              <p className="text-xl font-semibold tabular-nums">{awayToday.length}</p>
            </div>
          </div>
        }
      />

      {focusedUserId && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFocusedUserId(null)}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-muted/50"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to my team
          </button>
          {manager && (
            <button
              type="button"
              onClick={() => setFocusedUserId(manager.id)}
              className="inline-flex h-9 items-center rounded-md border border-primary/20 bg-primary/5 px-3 text-sm font-medium text-primary hover:bg-primary/10"
            >
              View manager
            </button>
          )}
        </div>
      )}

      {/* Manager action strip */}
      {subordinates.length > 0 && !focusedUserId && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Direct reports</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{subordinates.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium">Away today</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{awayToday.length}</p>
          </div>
          <Link
            href="/leaves/approvals"
            className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ClipboardCheck className="h-4 w-4" />
                <span className="text-xs font-medium">Pending approvals</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-amber-700 dark:text-amber-400">
              {pendingCount ?? 0}
            </p>
          </Link>
        </section>
      )}

      {/* Today present / absent */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="h-5 w-1 rounded-full bg-primary" aria-hidden />
              <h2 className="text-base font-semibold tracking-tight sm:text-lg">
                Today’s attendance
              </h2>
            </div>
            <p className="pl-3.5 text-xs text-muted-foreground">
              Your circle · {moment().format("dddd, MMM D")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {presentToday.length} present
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-1 text-red-700 dark:text-red-400">
              <UserX className="h-3.5 w-3.5" />
              {absentToday.length} absent
            </span>
            {leaveToday.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-1 text-amber-700 dark:text-amber-400">
                <Calendar className="h-3.5 w-3.5" />
                {leaveToday.length} on leave
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
          <AttendanceTodayColumn
            title="Present"
            empty="No one has checked in yet"
            loading={attendanceLoading}
            tone="present"
            items={presentToday}
            onViewPhoto={(item) =>
              item.user.profilePictureUrl &&
              setSelectedPhoto({
                src: item.user.profilePictureUrl,
                name: `${item.user.firstName} ${item.user.lastName}`.trim(),
              })
            }
          />
          <AttendanceTodayColumn
            title="Absent"
            empty="Everyone in your circle is accounted for"
            loading={attendanceLoading}
            tone="absent"
            items={[...absentToday, ...leaveToday]}
            onViewPhoto={(item) =>
              item.user.profilePictureUrl &&
              setSelectedPhoto({
                src: item.user.profilePictureUrl,
                name: `${item.user.firstName} ${item.user.lastName}`.trim(),
              })
            }
          />
        </div>
      </section>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, role, or department"
            className="h-10 w-full rounded-lg border border-border bg-card pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setView("directory")}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
              view === "directory"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-3.5 w-3.5" />
            Directory
          </button>
          <button
            type="button"
            onClick={() => setView("org")}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
              view === "org"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Org
          </button>
          <button
            type="button"
            onClick={() => setView("tree")}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
              view === "tree"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <GitBranch className="h-3.5 w-3.5" />
            Tree
          </button>
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-4 transition-[gap] duration-500 ease-out",
          view === "tree" ? "xl:grid-cols-1" : "xl:grid-cols-12"
        )}
      >
        {/* People / tree panel */}
        <section
          className={cn(
            "flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 ease-out",
            view === "tree"
              ? "min-h-[calc(100dvh-11rem)] xl:col-span-1"
              : "xl:col-span-7"
          )}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="h-5 w-1 rounded-full bg-primary" aria-hidden />
              <h2 className="text-base font-semibold tracking-tight sm:text-lg">
                {view === "directory"
                  ? "Directory"
                  : view === "tree"
                    ? "Organization tree"
                    : "Reporting line"}
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {view === "directory"
                ? `${directoryPeople.length} people`
                : `${1 + peers.length + subordinates.length + (manager ? 1 : 0)} in view`}
            </span>
          </div>

          <div
            className={cn(
              "flex flex-1 flex-col p-4 sm:p-5 transition-all duration-500 ease-out",
              view === "tree" ? "justify-center sm:p-8" : "space-y-5"
            )}
          >
            {view === "directory" ? (
              directoryPeople.length > 0 ? (
                <div className="space-y-2">
                  {directoryPeople.map(({ member, label, highlight }) => (
                    <MemberRow
                      key={`${label}-${member.id}`}
                      member={member}
                      label={label}
                      highlight={highlight}
                      onViewPhoto={handleViewMemberPhoto}
                      onClick={
                        label === "You" || (focusedUserId && member.id === user?.id)
                          ? undefined
                          : () => setFocusedUserId(member.id)
                      }
                    />
                  ))}
                </div>
              ) : (
                <EmptyPeople query={query} />
              )
            ) : view === "tree" ? (
              <HierarchyTree
                manager={manager}
                user={user}
                peers={peers}
                subordinates={subordinates}
                focusedUserId={focusedUserId}
                query={query}
                expanded
                onFocus={setFocusedUserId}
                onViewPhoto={handleViewMemberPhoto}
              />
            ) : (
              <div className="space-y-5">
                {managerVisible && manager && (
                  <div>
                    <SectionLabel>Manager</SectionLabel>
                    <MemberRow
                      member={manager}
                      label="Manager"
                      onViewPhoto={handleViewMemberPhoto}
                      onClick={() => setFocusedUserId(manager.id)}
                    />
                  </div>
                )}

                {(userVisible || filteredPeers.length > 0) && (
                  <div>
                    <SectionLabel>You & peers</SectionLabel>
                    <div className="space-y-2">
                      {userVisible && user && (
                        <MemberRow
                          member={user}
                          label={focusedUserId ? "Selected" : "You"}
                          highlight
                          onViewPhoto={handleViewMemberPhoto}
                        />
                      )}
                      {filteredPeers.map((peer) => (
                        <MemberRow
                          key={peer.id}
                          member={peer}
                          label="Peer"
                          onViewPhoto={handleViewMemberPhoto}
                          onClick={() => setFocusedUserId(peer.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {filteredSubs.length > 0 && (
                  <div>
                    <SectionLabel>Direct reports</SectionLabel>
                    <div className="space-y-2">
                      {filteredSubs.map((sub) => (
                        <MemberRow
                          key={sub.id}
                          member={sub}
                          label="Report"
                          onViewPhoto={handleViewMemberPhoto}
                          onClick={() => setFocusedUserId(sub.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {!managerVisible && !userVisible && filteredPeers.length === 0 && filteredSubs.length === 0 && (
                  <EmptyPeople query={query} />
                )}

                {!manager && !focusedUserId && (
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-5 text-center">
                    <Building2 className="mx-auto h-5 w-5 text-muted-foreground/50" />
                    <p className="mt-2 text-sm font-medium text-foreground">Top of the line</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      No manager assigned above you in this view.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Who's away — collapses when Tree is active */}
        <section
          className={cn(
            "rounded-2xl border border-border bg-card transition-all duration-500 ease-out",
            view === "tree"
              ? "pointer-events-none max-h-0 -translate-x-2 overflow-hidden border-transparent opacity-0 xl:max-h-0 xl:translate-x-4 xl:scale-95"
              : "max-h-500 translate-x-0 opacity-100 xl:col-span-5 xl:scale-100"
          )}
          aria-hidden={view === "tree"}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-1 rounded-full bg-primary" aria-hidden />
                <h2 className="text-base font-semibold tracking-tight sm:text-lg">Who’s away</h2>
              </div>
              <p className="pl-3.5 text-xs text-muted-foreground">
                Approved or pending leave · today and next 14 days
              </p>
            </div>
            <Link href="/leaves" className="text-sm font-medium text-primary hover:underline">
              Leaves
            </Link>
          </div>

          <div className="p-4 sm:p-5">
            {leavesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
                ))}
              </div>
            ) : awayNow.length > 0 ? (
              <ul className="space-y-2">
                {awayNow.slice(0, 10).map((leave: any) => {
                  const today = moment().startOf("day");
                  const isOutNow =
                    today.isSameOrAfter(moment(leave.fromDate).startOf("day")) &&
                    today.isSameOrBefore(moment(leave.toDate).startOf("day"));
                  const inCircle = circleIds.has(leave.user?.id);
                  const pic = leave.user?.profilePicture?.url;

                  return (
                    <li
                      key={leave.id}
                      className="flex items-center gap-3 rounded-xl border border-border px-3 py-3"
                    >
                      <Avatar
                        className={cn("h-10 w-10 rounded-lg", pic && "cursor-zoom-in")}
                        onClick={() => {
                          if (!pic) return;
                          setSelectedPhoto({
                            src: pic,
                            name: `${leave.user?.firstName || ""} ${leave.user?.lastName || ""}`.trim(),
                          });
                        }}
                      >
                        <AvatarImage src={pic} className="object-cover" />
                        <AvatarFallback className="rounded-lg bg-muted text-xs font-semibold">
                          {leave.user?.firstName?.[0]}
                          {leave.user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {leave.user?.firstName} {leave.user?.lastName}
                          </p>
                          <span
                            className={cn(
                              "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                              isOutNow
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {isOutNow ? "Out now" : "Upcoming"}
                          </span>
                          {inCircle && (
                            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              Your circle
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {leave.leaveType?.name || "Leave"} ·{" "}
                          {moment(leave.fromDate).format("MMM D")}
                          {" – "}
                          {moment(leave.toDate).format("MMM D")}
                          {" · "}
                          <span className="capitalize">{leave.status}</span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-12 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                  <UserRound className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground">Everyone’s in</p>
                <p className="max-w-55 text-xs text-muted-foreground">
                  No team leave today or in the next two weeks.
                </p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href="/leaves"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border text-sm font-medium hover:bg-muted/50"
              >
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                Request leave
              </Link>
              <button
                type="button"
                onClick={() => {
                  setView("directory");
                  setQuery("");
                }}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary/10 text-sm font-medium text-primary hover:bg-primary/15"
              >
                <Users className="h-3.5 w-3.5" />
                Browse people
              </button>
            </div>
          </div>
        </section>
      </div>
      <PhotoOverlay
        open={Boolean(selectedPhoto)}
        onOpenChange={(open) => !open && setSelectedPhoto(null)}
        src={selectedPhoto?.src}
        name={selectedPhoto?.name}
      />
    </div>
  );
}

function EmptyPeople({ query }: { query: string }) {
  return (
    <EmptyState
      src={EmptyImages.team}
      title={query ? "No matches" : "No people in this view"}
      description={
        query ? `Nothing found for “${query}”.` : "Your reporting circle will appear here."
      }
      size="wide"
      className="rounded-xl border border-dashed border-border"
    />
  );
}

function AttendanceTodayColumn({
  title,
  empty,
  loading,
  tone,
  items,
  onViewPhoto,
}: {
  title: string;
  empty: string;
  loading: boolean;
  tone: "present" | "absent";
  items: {
    status: string;
    loginTime?: string | null;
    logoutTime?: string | null;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profilePictureUrl?: string | null;
      designation?: { name: string } | null;
    };
  }[];
  onViewPhoto?: (item: {
    status: string;
    loginTime?: string | null;
    logoutTime?: string | null;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profilePictureUrl?: string | null;
      designation?: { name: string } | null;
    };
  }) => void;
}) {
  return (
    <div className="flex flex-col p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs tabular-nums text-muted-foreground">{items.length}</span>
      </div>

      {loading && items.length === 0 ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-3 py-10 text-center">
          {tone === "present" ? (
            <CheckCircle2 className="h-5 w-5 text-muted-foreground/40" />
          ) : (
            <UserX className="h-5 w-5 text-muted-foreground/40" />
          )}
          <p className="text-xs text-muted-foreground">{empty}</p>
        </div>
      ) : (
        <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {items.map((item) => {
            const isLeave = item.status === "leave";
            return (
              <li
                key={`${item.status}-${item.user.id}`}
                className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5"
              >
                <Avatar
                  className={cn("h-9 w-9 rounded-lg", item.user.profilePictureUrl && "cursor-zoom-in")}
                  onClick={() => onViewPhoto?.(item)}
                >
                  <AvatarImage
                    src={item.user.profilePictureUrl || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-lg bg-muted text-xs font-semibold">
                    {item.user.firstName?.[0]}
                    {item.user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.user.firstName} {item.user.lastName}
                    </p>
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        isLeave
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          : tone === "present"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-red-500/10 text-red-700 dark:text-red-400"
                      )}
                    >
                      {isLeave ? "Leave" : tone === "present" ? "Present" : "Absent"}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.user.designation?.name || "Team member"}
                    {tone === "present" && item.loginTime
                      ? ` · In ${String(item.loginTime).slice(0, 5)}`
                      : ""}
                    {tone === "present" && item.logoutTime
                      ? ` · Out ${String(item.logoutTime).slice(0, 5)}`
                      : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

