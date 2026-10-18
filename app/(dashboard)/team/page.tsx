"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import moment from "moment";
import { useQuery } from "@apollo/client/react";
import { GET_TEAM_HIERARCHY } from "@/lib/graphql/users/queries";
import { useGraphQLTeamLeaves, useGraphQLLeaveRequests, useGraphQLCompanyHolidays } from "@/lib/graphql/leaves/leavesHook";
import { useGraphQLTeamAttendanceToday } from "@/lib/graphql/attendance/attendanceHooks";
import { PageHeader } from "@/components/common/PageHeader";
import { PhotoOverlay } from "@/components/common/PhotoOverlay";
import { UserProfileModal } from "@/components/common/UserProfileModal";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { Pagination } from "@/components/common/Pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, resolveAvatarUrl } from "@/lib/utils";
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
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Network,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  employeeId?: string | null;
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
  designation?: { name: string } | null;
  department?: { name: string } | null;
  officeLocation?: { name: string } | null;
  organization?: { name: string } | null;
  role?: string | null;
  subordinates?: Member[] | null;
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
  onViewProfile,
}: {
  member: Member;
  label?: string;
  highlight?: boolean;
  onClick?: () => void;
  onViewPhoto?: (member: Member) => void;
  onViewProfile?: (member: Member) => void;
}) {
  const handleClick = onClick || (onViewProfile ? () => onViewProfile(member) : undefined);
  const interactive = Boolean(handleClick);

  const content = (
    <>
      <Avatar
        className="h-10 w-10 rounded-lg cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          if (onViewProfile) {
            onViewProfile(member);
          } else if (onViewPhoto && member.profilePictureUrl) {
            onViewPhoto(member);
          }
        }}
        title="View profile card"
      >
        <AvatarImage src={resolveAvatarUrl(member.profilePictureUrl) || undefined} className="object-cover" />
        <AvatarFallback className="rounded-lg bg-primary/10 text-sm font-semibold text-primary">
          {initials(member)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{memberName(member)}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {member.designation?.name || "Team member"}
          {member.department?.name ? ` · ${member.department.name}` : ""}
        </p>
      </div>
      {label && (
        <span
          className={cn(
            "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            highlight
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {label}
        </span>
      )}

      {interactive && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />}
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={`View ${memberName(member)}'s details`}
        className={cn(
          "group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer",
          highlight
            ? "border-primary/25 bg-primary/5 hover:bg-primary/10 hover:border-primary/40"
            : "border-border bg-card hover:bg-muted/40 hover:border-border/80"
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
  reportsCount,
  subLabel,
  onClick,
  onViewPhoto,
  onViewProfile,
}: {
  member: Member;
  label?: string;
  subLabel?: string;
  highlight?: boolean;
  expanded?: boolean;
  reportsCount?: number;
  onClick?: () => void;
  onViewPhoto?: (member: Member) => void;
  onViewProfile?: (member: Member) => void;
}) {
  const isInteractive = Boolean(onClick);

  const getBadgeStyle = (lbl?: string) => {
    if (!lbl) return "";
    const lower = lbl.toLowerCase();
    if (lower === "you" || lower === "selected") {
      return "bg-primary text-primary-foreground font-semibold shadow-xs";
    }
    if (lower.includes("manager")) {
      return "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-medium";
    }
    if (lower.includes("report")) {
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium";
    }
    return "bg-muted/70 text-muted-foreground hover:text-foreground font-medium border border-border/60";
  };

  const className = cn(
    "group relative flex shrink-0 flex-col items-center rounded-2xl border text-center transition-all duration-300 ease-out select-none",
    expanded ? "w-44 p-3.5 sm:w-48 sm:p-4" : "w-[9.5rem] p-3 sm:w-40",
    highlight
      ? "border-primary bg-card ring-2 ring-primary/40 shadow-xl shadow-primary/15 scale-105 z-10"
      : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30 hover:shadow-md",
    isInteractive && "cursor-pointer"
  );

  const body = (
    <>
      <div className="relative">
        <Avatar
          className={cn(
            "rounded-xl transition-all duration-300 cursor-pointer group-hover:scale-105 active:scale-95 shadow-sm",
            expanded ? "h-14 w-14 sm:h-16 sm:w-16" : "h-12 w-12"
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (onViewProfile) {
              onViewProfile(member);
            } else if (onViewPhoto && member.profilePictureUrl) {
              onViewPhoto(member);
            }
          }}
          title="View profile card"
        >
          <AvatarImage src={resolveAvatarUrl(member.profilePictureUrl) || undefined} className="object-cover" />
          <AvatarFallback className="rounded-xl bg-primary/10 text-sm font-semibold text-primary">
            {initials(member)}
          </AvatarFallback>
        </Avatar>
      </div>

      {label && (
        <span
          className={cn(
            "mt-2 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider",
            getBadgeStyle(label)
          )}
        >
          {label}
        </span>
      )}

      <p className="mt-1.5 w-full truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors sm:text-base">
        {memberName(member)}
      </p>

      {subLabel && (
        <p className="mt-0.5 line-clamp-1 w-full text-[10px] font-medium text-primary/80">
          {subLabel}
        </p>
      )}

      <p className="mt-0.5 line-clamp-1 w-full text-[11px] leading-snug text-muted-foreground sm:text-xs">
        {member.designation?.name || "Team member"}
      </p>

      {member.department?.name && (
        <p className="mt-0.5 line-clamp-1 w-full text-[10px] text-muted-foreground/75">
          {member.department.name}
        </p>
      )}

      {reportsCount !== undefined && reportsCount > 0 && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{reportsCount} {reportsCount === 1 ? "report" : "reports"}</span>
        </div>
      )}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
        title={`Click to focus hierarchy on ${memberName(member)}`}
      >
        {body}
      </button>
    );
  }

  return <div className={className}>{body}</div>;
}

function MultiRowTreeBranch<T>({
  items,
  maxPerRow = 5,
  renderItem,
  hasParentConnector = true,
  sectionTitle,
}: {
  items: T[];
  maxPerRow?: number;
  renderItem: (item: T, globalIndex: number, rowIndex: number) => React.ReactNode;
  hasParentConnector?: boolean;
  sectionTitle?: string;
}) {
  if (items.length === 0) return null;

  // Chunk items into rows of at most maxPerRow (or single row if maxPerRow <= 0)
  const rows: T[][] = [];
  const limit = maxPerRow > 0 ? maxPerRow : items.length;
  for (let i = 0; i < items.length; i += limit) {
    rows.push(items.slice(i, i + limit));
  }

  return (
    <div className="flex flex-col items-center w-full">
      {hasParentConnector && (
        <div className="w-0.5 h-6 bg-border/80 shrink-0" aria-hidden />
      )}

      {rows.map((row, rowIndex) => {
        const isFirstRow = rowIndex === 0;

        return (
          <div key={rowIndex} className="flex flex-col items-center w-full">
            {/* If not first row: Clean continuation indicator instead of a misleading vertical stem into a card */}
            {!isFirstRow && (
              <div className="my-3 flex items-center justify-center gap-2 select-none">
                <div className="h-px w-10 sm:w-16 bg-border/80" />
                <span className="rounded-full border border-border/80 bg-muted/60 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {sectionTitle ? `${sectionTitle} (Row ${rowIndex + 1})` : `Row ${rowIndex + 1}`}
                </span>
                <div className="h-px w-10 sm:w-16 bg-border/80" />
              </div>
            )}

            {row.length === 1 ? (
              <div className="flex flex-col items-center">
                <div className="relative w-full h-6 shrink-0" aria-hidden>
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-border/80" />
                </div>
                {renderItem(row[0], rowIndex * limit, rowIndex)}
              </div>
            ) : (
              <div className="flex flex-row flex-nowrap items-start justify-center">
                {row.map((item, colIndex) => {
                  const globalIndex = rowIndex * limit + colIndex;
                  const isFirstCol = colIndex === 0;
                  const isLastCol = colIndex === row.length - 1;

                  return (
                    <div
                      key={colIndex}
                      className="relative flex flex-col items-center px-2.5 sm:px-3"
                    >
                      {/* Connector lines above each card */}
                      <div className="relative w-full h-6 shrink-0" aria-hidden>
                        {/* Horizontal busbar segment */}
                        <div
                          className={cn(
                            "absolute top-0 h-0.5 bg-border/80",
                            isFirstCol && "left-1/2 right-0",
                            isLastCol && "left-0 right-1/2",
                            !isFirstCol && !isLastCol && "left-0 right-0"
                          )}
                        />
                        {/* Vertical drop line to card */}
                        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-border/80" />
                      </div>

                      {/* The card itself */}
                      {renderItem(item, globalIndex, rowIndex)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HierarchyTree({
  managementChain = [],
  manager,
  user,
  peers = [],
  subordinates = [],
  focusedUserId,
  query,
  expanded,
  onFocus,
  onViewPhoto,
  onViewProfile,
}: {
  managementChain?: Member[];
  manager: Member | null;
  user: Member | null;
  peers: Member[];
  subordinates: Member[];
  focusedUserId: string | null;
  query: string;
  expanded?: boolean;
  onFocus: (id: string) => void;
  onViewPhoto?: (member: Member) => void;
  onViewProfile?: (member: Member) => void;
}) {
  const [showPeers, setShowPeers] = useState(true);
  const [maxPerRow, setMaxPerRow] = useState<number>(5);
  const [zoom, setZoom] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.1).toFixed(1)), 1.3));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.1).toFixed(1)), 0.6));
  const handleResetZoom = () => setZoom(1);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Auto center scroll on focus change
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const center = (container.scrollWidth - container.clientWidth) / 2;
      if (center > 0) {
        container.scrollTo({ left: center, behavior: "smooth" });
      }
    }
  }, [focusedUserId, showPeers, zoom]);

  // Determine upper managers (skip-level managers above immediate manager)
  // managementChain is ordered top-down: [Executive, Manager's Manager, Immediate Manager]
  const immediateManager = manager || (managementChain.length > 0 ? managementChain[managementChain.length - 1] : null);
  const upperManagers = useMemo(() => {
    if (managementChain.length <= 1) return [];
    return managementChain.slice(0, -1);
  }, [managementChain]);

  const visibleUpperManagers = upperManagers.filter((m) => matchesQuery(m, query));
  const immediateManagerVisible = immediateManager && matchesQuery(immediateManager, query);
  const userVisible = user && matchesQuery(user, query);
  const visiblePeers = peers.filter((p) => matchesQuery(p, query));
  const visibleSubs = subordinates.filter((s) => matchesQuery(s, query));

  // Symmetrically divide peers into left and right wings around the focused user
  const { leftPeers, rightPeers } = useMemo(() => {
    if (!showPeers || visiblePeers.length === 0) {
      return { leftPeers: [], rightPeers: [] };
    }
    const half = Math.ceil(visiblePeers.length / 2);
    return {
      leftPeers: visiblePeers.slice(0, half),
      rightPeers: visiblePeers.slice(half),
    };
  }, [showPeers, visiblePeers]);

  const totalVisible =
    visibleUpperManagers.length +
    (immediateManagerVisible ? 1 : 0) +
    (userVisible ? 1 : 0) +
    (showPeers ? visiblePeers.length : 0) +
    visibleSubs.length;

  if (totalVisible === 0) {
    return <EmptyPeople query={query} />;
  }

  // Breadcrumbs chain: from top executive down to focused user
  const breadcrumbChain: Member[] = useMemo(() => {
    const list: Member[] = [...managementChain];
    if (user && !list.some((m) => m.id === user.id)) {
      list.push(user);
    }
    return list;
  }, [managementChain, user]);

  return (
    <div className="relative flex flex-col w-full">
      {/* Hierarchy Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4 px-2 sm:px-4">
        {/* Breadcrumbs for MS Teams style navigation */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto py-1">
          <span className="font-semibold text-foreground/80 flex items-center gap-1">
            <Network className="h-3.5 w-3.5 text-primary" />
            Chain:
          </span>
          {breadcrumbChain.map((crumb, idx) => {
            const isLast = idx === breadcrumbChain.length - 1;
            const isUser = user && crumb.id === user.id;

            return (
              <div key={crumb.id} className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onFocus(crumb.id)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors",
                    isLast
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={`Focus on ${memberName(crumb)}`}
                >
                  <Avatar className="h-4 w-4 rounded-full">
                    <AvatarImage src={resolveAvatarUrl(crumb.profilePictureUrl) || undefined} />
                    <AvatarFallback className="text-[8px] bg-primary/20 text-primary">
                      {initials(crumb)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{memberName(crumb)}</span>
                  {isUser && !focusedUserId && (
                    <span className="text-[10px] text-primary font-bold">(You)</span>
                  )}
                </button>
                {!isLast && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Toolbar action buttons: Zoom, Peers Toggle, Scroll */}
        <div className="flex items-center gap-2 shrink-0">
          {visiblePeers.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPeers(!showPeers)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors",
                showPeers
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={showPeers ? "Hide peers to focus on direct line" : "Show peers in tree"}
            >
              <Users className="h-3.5 w-3.5" />
              <span>{showPeers ? `Peers (${visiblePeers.length})` : "Show Peers"}</span>
            </button>
          )}

          {/* Row limit controls */}
          <div className="flex items-center rounded-lg border border-border bg-card p-0.5 text-xs">
            <span className="px-2 text-muted-foreground font-medium hidden md:inline">Limit:</span>
            <button
              type="button"
              onClick={() => setMaxPerRow(5)}
              className={cn(
                "h-7 px-2.5 rounded-md font-medium transition-colors",
                maxPerRow === 5
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Show max 5 employees per row"
            >
              5 / row
            </button>
            <button
              type="button"
              onClick={() => setMaxPerRow(6)}
              className={cn(
                "h-7 px-2.5 rounded-md font-medium transition-colors",
                maxPerRow === 6
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Show max 6 employees per row"
            >
              6 / row
            </button>
            <button
              type="button"
              onClick={() => setMaxPerRow(0)}
              className={cn(
                "h-7 px-2.5 rounded-md font-medium transition-colors",
                maxPerRow === 0
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Show all employees in a single row"
            >
              All
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center rounded-lg border border-border bg-card p-0.5 text-xs">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.6}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="h-7 px-1.5 font-medium tabular-nums text-muted-foreground hover:text-foreground"
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 1.3}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Scroll buttons for wide branches */}
          <div className="hidden sm:flex items-center rounded-lg border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Tree Container */}
      <div
        ref={scrollContainerRef}
        className={cn(
          "w-full overflow-x-auto transition-all duration-300 ease-out select-none",
          expanded ? "min-h-[min(70vh,42rem)] py-8" : "pb-4 pt-4"
        )}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
            transition: "transform 200ms ease-out",
          }}
          className="mx-auto flex min-w-max flex-col items-center px-4"
        >
          {/* LEVEL 1: Upper Management Chain (Stacked vertically) */}
          {visibleUpperManagers.length > 0 && (
            <div className="flex flex-col items-center">
              {visibleUpperManagers.map((upperManager, idx) => {
                const isSkipLevel = idx === visibleUpperManagers.length - 1;
                const label = isSkipLevel ? "Manager's Manager" : "Leadership";
                const subLabel =
                  idx === 0
                    ? "Executive Chain"
                    : `Reports to ${upperManagers[idx - 1]?.firstName || "Leadership"}`;

                return (
                  <div key={upperManager.id} className="flex flex-col items-center">
                    <TreeNode
                      member={upperManager}
                      label={label}
                      subLabel={subLabel}
                      expanded={expanded}
                      onClick={() => onFocus(upperManager.id)}
                      onViewPhoto={onViewPhoto}
                      onViewProfile={onViewProfile}
                    />
                    <div className="w-0.5 h-6 bg-border/80 shrink-0" aria-hidden />
                  </div>
                );
              })}
            </div>
          )}

          {/* LEVEL 2: Immediate Manager */}
          {immediateManagerVisible && immediateManager && (
            <div className="flex flex-col items-center">
              <TreeNode
                member={immediateManager}
                label="Direct Manager"
                subLabel={user ? `Manages ${user.firstName} & team` : undefined}
                expanded={expanded}
                onClick={() => onFocus(immediateManager.id)}
                onViewPhoto={onViewPhoto}
                onViewProfile={onViewProfile}
              />
              <div className="w-0.5 h-6 bg-border/80 shrink-0" aria-hidden />
            </div>
          )}

          {/* LEVEL 3: Focused User (Centered) & Peers (Flanking Symmetrically) */}
          {userVisible && user && (
            <div className="flex flex-col items-center w-full">
              {!showPeers || visiblePeers.length === 0 ? (
                // Only user shown (peers hidden or none)
                <div className="flex flex-col items-center">
                  <TreeNode
                    member={user}
                    label={focusedUserId ? "Selected" : "You"}
                    subLabel={immediateManager ? `Reports to ${immediateManager.firstName}` : undefined}
                    highlight
                    expanded={expanded}
                    reportsCount={visibleSubs.length}
                    onViewPhoto={onViewPhoto}
                    onViewProfile={onViewProfile}
                  />
                  {visibleSubs.length > 0 && (
                    <div className="w-0.5 h-6 bg-border/80 shrink-0" aria-hidden />
                  )}
                </div>
              ) : (
                // Symmetrical 3-section tree row: Left Peers | Focused User (Center) | Right Peers
                <div className="flex flex-row items-start justify-center w-full">
                  {/* Left Peers Container: Pushed right against center user */}
                  <div className="flex flex-1 flex-row flex-nowrap items-start justify-end">
                    {leftPeers.map((peer, pIdx) => {
                      const isFirst = pIdx === 0;
                      return (
                        <div
                          key={peer.id}
                          className="relative flex flex-col items-center px-2.5 sm:px-3"
                        >
                          {/* Connector lines above card */}
                          <div className="relative w-full h-6 shrink-0" aria-hidden>
                            <div
                              className={cn(
                                "absolute top-0 h-0.5 bg-border/80",
                                isFirst ? "left-1/2 right-0" : "left-0 right-0"
                              )}
                            />
                            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-border/80" />
                          </div>
                          <TreeNode
                            member={peer}
                            label="Peer"
                            subLabel={immediateManager ? `Reports to ${immediateManager.firstName}` : undefined}
                            expanded={expanded}
                            onClick={() => onFocus(peer.id)}
                            onViewPhoto={onViewPhoto}
                            onViewProfile={onViewProfile}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Center: Focused User (Directly under Manager, directly above Direct Reports) */}
                  <div className="relative flex shrink-0 flex-col items-center px-2.5 sm:px-3">
                    <div className="relative w-full h-6 shrink-0" aria-hidden>
                      {/* Horizontal busbar segment across user */}
                      <div
                        className={cn(
                          "absolute top-0 h-0.5 bg-border/80",
                          leftPeers.length > 0 && rightPeers.length > 0 && "left-0 right-0",
                          leftPeers.length > 0 && rightPeers.length === 0 && "left-0 right-1/2",
                          leftPeers.length === 0 && rightPeers.length > 0 && "left-1/2 right-0",
                          leftPeers.length === 0 && rightPeers.length === 0 && "hidden"
                        )}
                      />
                      {/* Vertical line from manager busbar into user */}
                      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-border/80" />
                    </div>

                    <TreeNode
                      member={user}
                      label={focusedUserId ? "Selected" : "You"}
                      subLabel={immediateManager ? `Reports to ${immediateManager.firstName}` : undefined}
                      highlight
                      expanded={expanded}
                      reportsCount={visibleSubs.length}
                      onViewPhoto={onViewPhoto}
                      onViewProfile={onViewProfile}
                    />

                    {/* Bottom vertical line ONLY for focused user to direct reports */}
                    {visibleSubs.length > 0 && (
                      <div className="w-0.5 h-6 bg-border/80 shrink-0" aria-hidden />
                    )}
                  </div>

                  {/* Right Peers Container: Pushed left against center user */}
                  <div className="flex flex-1 flex-row flex-nowrap items-start justify-start">
                    {rightPeers.map((peer, pIdx) => {
                      const isLast = pIdx === rightPeers.length - 1;
                      return (
                        <div
                          key={peer.id}
                          className="relative flex flex-col items-center px-2.5 sm:px-3"
                        >
                          {/* Connector lines above card */}
                          <div className="relative w-full h-6 shrink-0" aria-hidden>
                            <div
                              className={cn(
                                "absolute top-0 h-0.5 bg-border/80",
                                isLast ? "left-0 right-1/2" : "left-0 right-0"
                              )}
                            />
                            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-border/80" />
                          </div>
                          <TreeNode
                            member={peer}
                            label="Peer"
                            subLabel={immediateManager ? `Reports to ${immediateManager.firstName}` : undefined}
                            expanded={expanded}
                            onClick={() => onFocus(peer.id)}
                            onViewPhoto={onViewPhoto}
                            onViewProfile={onViewProfile}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Peers Quick Bar (when peers are hidden via toggle) */}
          {!showPeers && visiblePeers.length > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/80 flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                Peers ({visiblePeers.length}):
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {visiblePeers.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onFocus(p.id)}
                    className="inline-flex items-center gap-1 rounded-md bg-card border border-border/80 px-2 py-0.5 font-medium hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    <Avatar className="h-4 w-4 rounded-full">
                      <AvatarImage src={resolveAvatarUrl(p.profilePictureUrl) || undefined} />
                      <AvatarFallback className="text-[8px] bg-primary/20 text-primary">
                        {initials(p)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{memberName(p)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LEVEL 4: Direct Reports (Subordinates) */}
          {visibleSubs.length > 0 ? (
            <div className="flex flex-col items-center w-full">
              <div className="mb-2 flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-xs">
                <Users className="h-3.5 w-3.5" />
                <span>
                  Direct Reports {user ? `to ${memberName(user)}` : ""} ({visibleSubs.length})
                </span>
              </div>
              <MultiRowTreeBranch
                items={visibleSubs}
                maxPerRow={maxPerRow}
                hasParentConnector={true}
                sectionTitle="Direct Reports"
                renderItem={(sub) => (
                  <TreeNode
                    member={sub}
                    label="Direct Report"
                    subLabel={user ? `Reports to ${user.firstName}` : undefined}
                    expanded={expanded}
                    onClick={() => onFocus(sub.id)}
                    onViewPhoto={onViewPhoto}
                    onViewProfile={onViewProfile}
                  />
                )}
              />
            </div>
          ) : (
            user && (
              <div className="mt-4 flex flex-col items-center text-center">
                <p className="text-xs text-muted-foreground/70">
                  {focusedUserId ? `${memberName(user)} has no direct reports.` : "You have no direct reports."}
                </p>
              </div>
            )
          )}

          {!immediateManager && visibleUpperManagers.length === 0 && !focusedUserId && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              You are at the top of this reporting line.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [focusedUserId, setFocusedUserId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("directory");
  const [query, setQuery] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<{ src: string; name: string } | null>(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState<any | null>(null);

  const { data, loading, error } = useQuery(GET_TEAM_HIERARCHY, {
    variables: { userId: focusedUserId },
    notifyOnNetworkStatusChange: true,
  });

  const { teamLeavesData, isLoading: leavesLoading } = useGraphQLTeamLeaves();
  const { leaveRequestData: pendingApprovals } = useGraphQLLeaveRequests(true);
  const { companyHolidaysData } = useGraphQLCompanyHolidays();
  const {
    teamAttendanceToday,
    isLoading: attendanceLoading,
  } = useGraphQLTeamAttendanceToday();

  // Upcoming company holidays
  const upcomingHolidays = useMemo(() => {
    const today = moment().startOf("day");
    return (companyHolidaysData || [])
      .filter((h: any) => moment(h.holidayDate).isSameOrAfter(today))
      .sort((a: any, b: any) => moment(a.holidayDate).diff(moment(b.holidayDate)));
  }, [companyHolidaysData]);

  // Pagination states
  const [directoryPage, setDirectoryPage] = useState(1);
  const DIRECTORY_PAGE_SIZE = 6;

  const [peersPage, setPeersPage] = useState(1);
  const PEERS_PAGE_SIZE = 5;

  const [subsPage, setSubsPage] = useState(1);
  const SUBS_PAGE_SIZE = 5;

  const [awayPage, setAwayPage] = useState(1);
  const AWAY_PAGE_SIZE = 5;

  // Reset pagination when search query or view mode changes
  useEffect(() => {
    setDirectoryPage(1);
    setPeersPage(1);
    setSubsPage(1);
    setAwayPage(1);
  }, [query, view]);

  const hierarchy = (data as any)?.teamHierarchy;
  const manager: Member | null = hierarchy?.manager || null;
  const user: Member | null = hierarchy?.user || null;
  const peers: Member[] = hierarchy?.peers || [];
  const subordinates: Member[] = hierarchy?.subordinates || [];
  const managementChain: Member[] = hierarchy?.managementChain || [];

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
    managementChain.forEach((m) => ids.add(m.id));
    return ids;
  }, [user, peers, subordinates, manager, managementChain]);

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
    // Include upper managers from managementChain
    managementChain.forEach((m, idx) => {
      const isImmediate = idx === managementChain.length - 1;
      if (!isImmediate) {
        list.push({
          member: m,
          label: idx === managementChain.length - 2 ? "Manager's Manager" : "Leadership",
        });
      }
    });
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
  }, [managementChain, manager, user, peers, subordinates, focusedUserId, query]);

  const filteredPeers = peers.filter((p) => matchesQuery(p, query));
  const filteredSubs = subordinates.filter((s) => matchesQuery(s, query));
  const managerVisible = manager && matchesQuery(manager, query);
  const userVisible = user && matchesQuery(user, query);

  // Paginated Directory People
  const totalDirectoryPages = Math.max(1, Math.ceil(directoryPeople.length / DIRECTORY_PAGE_SIZE));
  const safeDirectoryPage = Math.min(directoryPage, totalDirectoryPages);
  const paginatedDirectoryPeople = useMemo(() => {
    const start = (safeDirectoryPage - 1) * DIRECTORY_PAGE_SIZE;
    return directoryPeople.slice(start, start + DIRECTORY_PAGE_SIZE);
  }, [directoryPeople, safeDirectoryPage]);

  // Paginated Org Peers
  const totalPeersPages = Math.max(1, Math.ceil(filteredPeers.length / PEERS_PAGE_SIZE));
  const safePeersPage = Math.min(peersPage, totalPeersPages);
  const paginatedPeers = useMemo(() => {
    const start = (safePeersPage - 1) * PEERS_PAGE_SIZE;
    return filteredPeers.slice(start, start + PEERS_PAGE_SIZE);
  }, [filteredPeers, safePeersPage]);

  // Paginated Org Subordinates
  const totalSubsPages = Math.max(1, Math.ceil(filteredSubs.length / SUBS_PAGE_SIZE));
  const safeSubsPage = Math.min(subsPage, totalSubsPages);
  const paginatedSubs = useMemo(() => {
    const start = (safeSubsPage - 1) * SUBS_PAGE_SIZE;
    return filteredSubs.slice(start, start + SUBS_PAGE_SIZE);
  }, [filteredSubs, safeSubsPage]);

  // Paginated Away Now
  const totalAwayPages = Math.max(1, Math.ceil(awayNow.length / AWAY_PAGE_SIZE));
  const safeAwayPage = Math.min(awayPage, totalAwayPages);
  const paginatedAwayNow = useMemo(() => {
    const start = (safeAwayPage - 1) * AWAY_PAGE_SIZE;
    return awayNow.slice(start, start + AWAY_PAGE_SIZE);
  }, [awayNow, safeAwayPage]);

  if (loading && !data) {
    return (
      <div className="w-full">
        <PageSkeleton variant="split" />
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

  const handleViewProfile = (member: any) => {
    if (!member) return;
    setSelectedProfileUser(member);
  };

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
          <div className="flex w-full items-center justify-between gap-4 rounded-xl border border-border bg-background/70 px-4 py-3 sm:w-auto">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-[11px] text-nowrap font-medium text-muted-foreground">Present</p>
              <p className="text-xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {presentToday.length}
              </p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-[11px] text-nowrap font-medium text-muted-foreground">On leave</p>
              <p className="text-xl font-semibold tabular-nums text-red-600 dark:text-red-400">
                {absentToday.length}
              </p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-[11px] text-nowrap font-medium text-muted-foreground">Out today</p>
              <p className="text-xl font-semibold tabular-nums">{awayToday.length}</p>
            </div>
          </div>
        }
      />

      {focusedUserId && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFocusedUserId(null)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back to my team
            </button>
            {manager && (
              <button
                type="button"
                onClick={() => setFocusedUserId(manager.id)}
                className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                View manager
              </button>
            )}
            {managementChain.length > 1 && (
              <button
                type="button"
                onClick={() => setFocusedUserId(managementChain[managementChain.length - 2].id)}
                className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                View manager&apos;s manager
              </button>
            )}
          </div>
          {user && (
            <span className="text-xs text-muted-foreground">
              Viewing <strong className="font-semibold text-foreground">{memberName(user)}</strong>
            </span>
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
              {absentToday.length} on leave
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
            onViewProfile={(itemUser) => handleViewProfile(itemUser)}
          />
          <AttendanceTodayColumn
            title="On leave"
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
            onViewProfile={(itemUser) => handleViewProfile(itemUser)}
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

        <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/80">
          {[
            { id: "directory" as const, label: "Directory", icon: List },
            { id: "org" as const, label: "Org", icon: LayoutGrid },
            { id: "tree" as const, label: "Tree", icon: GitBranch },
          ].map((t) => {
            const Icon = t.icon;
            const active = view === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setView(t.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                  active
                    ? "bg-background text-foreground shadow-xs font-semibold border border-border/40"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", active && "text-primary")} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-4 items-start transition-[gap] duration-500 ease-out",
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
                <div className="flex flex-col justify-between flex-1 space-y-4">
                  <div className="space-y-2">
                    {paginatedDirectoryPeople.map(({ member, label, highlight }) => (
                      <MemberRow
                        key={`${label}-${member.id}`}
                        member={member}
                        label={label}
                        highlight={highlight}
                        onViewPhoto={handleViewMemberPhoto}
                        onViewProfile={handleViewProfile}
                        onClick={() => handleViewProfile(member)}
                      />
                    ))}
                  </div>

                  {totalDirectoryPages > 1 && (
                    <div className="pt-2">
                      <Pagination
                        currentPage={safeDirectoryPage}
                        totalPages={totalDirectoryPages}
                        onPageChange={setDirectoryPage}
                        total={directoryPeople.length}
                        pageSize={DIRECTORY_PAGE_SIZE}
                        label="people"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <EmptyPeople query={query} />
              )
            ) : view === "tree" ? (
              <HierarchyTree
                managementChain={managementChain}
                manager={manager}
                user={user}
                peers={peers}
                subordinates={subordinates}
                focusedUserId={focusedUserId}
                query={query}
                expanded
                onFocus={setFocusedUserId}
                onViewPhoto={handleViewMemberPhoto}
                onViewProfile={handleViewProfile}
              />
            ) : (
              <div className="space-y-5">
                {managementChain.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <SectionLabel>Management line</SectionLabel>
                      <span className="text-xs text-muted-foreground">
                        {managementChain.length} {managementChain.length === 1 ? "level" : "levels"} above
                      </span>
                    </div>
                    <div className="space-y-2">
                      {managementChain.map((m, idx) => {
                        const isImmediate = idx === managementChain.length - 1;
                        const label = isImmediate
                          ? "Manager"
                          : idx === managementChain.length - 2
                            ? "Manager's Manager"
                            : "Leadership";
                        return (
                          <MemberRow
                            key={m.id}
                            member={m}
                            label={label}
                            onViewPhoto={handleViewMemberPhoto}
                            onViewProfile={handleViewProfile}
                            onClick={() => setFocusedUserId(m.id)}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : managerVisible && manager ? (
                  <div>
                    <SectionLabel>Manager</SectionLabel>
                    <MemberRow
                      member={manager}
                      label="Manager"
                      onViewPhoto={handleViewMemberPhoto}
                      onViewProfile={handleViewProfile}
                      onClick={() => setFocusedUserId(manager.id)}
                    />
                  </div>
                ) : null}

                {(userVisible || filteredPeers.length > 0) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <SectionLabel>You & peers</SectionLabel>
                      {filteredPeers.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {filteredPeers.length + (userVisible ? 1 : 0)} people
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {userVisible && user && (
                        <MemberRow
                          member={user}
                          label={focusedUserId ? "Selected" : "You"}
                          highlight
                          onViewPhoto={handleViewMemberPhoto}
                          onViewProfile={handleViewProfile}
                          onClick={() => handleViewProfile(user)}
                        />
                      )}
                      {paginatedPeers.map((peer) => (
                        <MemberRow
                          key={peer.id}
                          member={peer}
                          label="Peer"
                          onViewPhoto={handleViewMemberPhoto}
                          onViewProfile={handleViewProfile}
                          onClick={() => handleViewProfile(peer)}
                        />
                      ))}
                    </div>
                    {totalPeersPages > 1 && (
                      <div className="pt-2 mt-2">
                        <Pagination
                          currentPage={safePeersPage}
                          totalPages={totalPeersPages}
                          onPageChange={setPeersPage}
                          total={filteredPeers.length}
                          pageSize={PEERS_PAGE_SIZE}
                          label="peers"
                        />
                      </div>
                    )}
                  </div>
                )}

                {filteredSubs.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <SectionLabel>Direct reports</SectionLabel>
                      <span className="text-xs text-muted-foreground">
                        {filteredSubs.length} reports
                      </span>
                    </div>
                    <div className="space-y-2">
                      {paginatedSubs.map((sub) => (
                        <MemberRow
                          key={sub.id}
                          member={sub}
                          label="Report"
                          onViewPhoto={handleViewMemberPhoto}
                          onViewProfile={handleViewProfile}
                          onClick={() => handleViewProfile(sub)}
                        />
                      ))}
                    </div>
                    {totalSubsPages > 1 && (
                      <div className="pt-2 mt-2">
                        <Pagination
                          currentPage={safeSubsPage}
                          totalPages={totalSubsPages}
                          onPageChange={setSubsPage}
                          total={filteredSubs.length}
                          pageSize={SUBS_PAGE_SIZE}
                          label="reports"
                        />
                      </div>
                    )}
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
            "self-start h-fit rounded-2xl border border-border bg-card transition-all duration-500 ease-out",
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
                Approved or pending leave
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
              <div className="space-y-3">
                <ul className="space-y-2">
                  {paginatedAwayNow.map((leave: any) => {
                    const today = moment().startOf("day");
                    const isOutNow =
                      today.isSameOrAfter(moment(leave.fromDate).startOf("day")) &&
                      today.isSameOrBefore(moment(leave.toDate).startOf("day"));
                    const inCircle = circleIds.has(leave.user?.id);
                    const pic = leave.user?.profilePicture?.url;

                    return (
                      <li
                        key={leave.id}
                        onClick={() => {
                          if (leave.user) {
                            handleViewProfile({
                              ...leave.user,
                              profilePictureUrl: leave.user?.profilePicture?.url || leave.user?.profilePictureUrl,
                            });
                          }
                        }}
                        title="View employee profile"
                        className="group flex items-center gap-3 rounded-xl border border-border px-3 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <Avatar
                          className="h-10 w-10 rounded-lg cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0"
                          onClick={() => {
                            if (leave.user) {
                              handleViewProfile({
                                ...leave.user,
                                profilePictureUrl: leave.user?.profilePicture?.url || leave.user?.profilePictureUrl,
                              });
                            }
                          }}
                          title="View profile card"
                        >
                          <AvatarImage src={resolveAvatarUrl(pic) || undefined} className="object-cover" />
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

                {totalAwayPages > 1 && (
                  <div className="pt-1">
                    <Pagination
                      currentPage={safeAwayPage}
                      totalPages={totalAwayPages}
                      onPageChange={setAwayPage}
                      total={awayNow.length}
                      pageSize={AWAY_PAGE_SIZE}
                      label="records"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-center">
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
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
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
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary/10 text-sm font-medium text-primary hover:bg-primary/15 transition-colors"
              >
                <Users className="h-3.5 w-3.5" />
                Browse people
              </button>
            </div>

            {/* Upcoming Company Holidays if present */}
            {upcomingHolidays.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/60">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Upcoming Holidays
                  </span>
                  <Link href="/leaves" className="text-[11px] font-medium text-primary hover:underline">
                    View calendar
                  </Link>
                </div>
                <div className="space-y-2">
                  {upcomingHolidays.slice(0, 2).map((holiday: any) => (
                    <div
                      key={holiday.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 text-xs hover:bg-muted/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{holiday.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {moment(holiday.holidayDate).format("dddd, MMM D, YYYY")}
                        </p>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                        {moment(holiday.holidayDate).fromNow()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      <PhotoOverlay
        open={Boolean(selectedPhoto)}
        onOpenChange={(open) => !open && setSelectedPhoto(null)}
        src={selectedPhoto?.src}
        name={selectedPhoto?.name}
      />
      <UserProfileModal
        userId={selectedProfileUser?.id ? String(selectedProfileUser.id) : null}
        open={Boolean(selectedProfileUser)}
        onOpenChange={(open) => !open && setSelectedProfileUser(null)}
        initialData={selectedProfileUser}
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
  onViewProfile,
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
  onViewProfile?: (user: any) => void;
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
                onClick={() => {
                  if (onViewProfile) {
                    onViewProfile(item.user);
                  } else {
                    onViewPhoto?.(item);
                  }
                }}
                title="View employee profile"
                className="group flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
              >
                <Avatar
                  className="h-9 w-9 rounded-lg cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  onClick={() => {
                    if (onViewProfile) {
                      onViewProfile(item.user);
                    } else {
                      onViewPhoto?.(item);
                    }
                  }}
                  title="View profile card"
                >
                  <AvatarImage
                    src={resolveAvatarUrl(item.user.profilePictureUrl) || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-lg bg-muted text-xs font-semibold">
                    {item.user.firstName?.[0]}
                    {item.user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.user.firstName} {item.user.lastName}
                  </p>
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
                <span
                  className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    isLeave
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      : tone === "present"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "bg-red-500/10 text-red-700 dark:text-red-400"
                  )}
                >
                  {isLeave ? "Leave" : tone === "present" ? "Present" : "On leave"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

