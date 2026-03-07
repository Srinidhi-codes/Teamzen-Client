"use client";

import { useQuery } from "@apollo/client/react";
import { GET_TEAM_HIERARCHY } from "@/lib/graphql/users/queries";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Building2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { useState, useRef } from "react";
import { useStore } from "@/lib/store/useStore";
import { ChevronLeft, RefreshCcw } from "lucide-react";

export default function TeamPage() {
    const { user: currentUser } = useStore();
    const [focusedUserId, setFocusedUserId] = useState<string | null>(null);

    // Refs for scrolling
    const userSectionRef = useRef<HTMLDivElement>(null);
    const subordinatesSectionRef = useRef<HTMLDivElement>(null);

    const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const { data, loading, error } = useQuery(GET_TEAM_HIERARCHY, {
        variables: { userId: focusedUserId },
        notifyOnNetworkStatusChange: true,
    });

    if (loading && !data) return (
        <div className="flex flex-col items-center justify-center p-20 min-h-[60vh] space-y-6">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-xl shadow-primary/20"></div>
            <p className="text-muted-foreground animate-pulse font-black text-[10px] uppercase tracking-[0.5em]">Syncing Organizational Intelligence...</p>
        </div>
    );

    if (error) return (
        <div className="p-20 text-center space-y-6 border border-destructive/20 rounded-[3rem] bg-destructive/5 max-w-2xl mx-auto my-12">
            <div className="text-6xl animate-bounce">⚠️</div>
            <div className="space-y-2">
                <p className="text-destructive font-black uppercase tracking-widest text-sm">Mapping sequence failed</p>
                <p className="text-muted-foreground text-sm font-medium">{error.message}</p>
            </div>
            <button
                onClick={() => setFocusedUserId(null)}
                className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
            >
                Reset Connection
            </button>
        </div>
    );

    const { manager, user, peers, subordinates } = (data as any).teamHierarchy;

    return (
        <div className="p-4 sm:p-8 space-y-12 animate-fade-in max-w-7xl mx-auto pb-24">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <RefreshCcw className={cn("w-4 h-4 text-primary", loading ? "animate-spin" : "")} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Global Talent Map</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-foreground sm:text-6xl lg:text-7xl">
                        {(focusedUserId && (data as any)?.teamHierarchy?.user) ? (
                            <>
                                <span className="text-primary truncate block max-w-2xl">
                                    {(data as any).teamHierarchy.user.firstName}'s
                                </span>
                                Environment
                            </>
                        ) : "Our Network"}
                    </h1>
                    <p className="text-muted-foreground font-medium max-w-xl text-lg leading-relaxed">
                        Explore the intricate connections and reporting lines across our organizational ecosystem.
                    </p>

                    {focusedUserId && (
                        <div className="flex items-center gap-4 pt-4">
                            <button
                                onClick={() => setFocusedUserId(null)}
                                className="group flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary/30 hover:shadow-lg transition-all"
                            >
                                <ChevronLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
                                Return to My View
                            </button>
                            {manager && (
                                <button
                                    onClick={() => setFocusedUserId(manager.id)}
                                    className="px-6 py-3 bg-primary/5 border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all"
                                >
                                    Focus on Manager
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-6 bg-card/50 backdrop-blur-xl px-8 py-6 rounded-[2.5rem] border border-border/50 shadow-2xl">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Direct Nodes</p>
                        <p className="text-4xl font-black">{subordinates.length}</p>
                    </div>
                    <div className="w-px h-12 bg-border/50" />
                    <div className="text-center">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Peer Nodes</p>
                        <p className="text-4xl font-black">{peers.length}</p>
                    </div>
                </div>
            </div>

            {/* Hierarchy Tree Visualization */}
            <div className="flex flex-col items-center space-y-16">

                {/* Manager Node (Clickable to Drill Up) */}
                {manager ? (
                    <div className="flex flex-col items-center w-full">
                        <TeamMemberCard
                            member={manager}
                            label="Reporting Manager"
                            variant="manager"
                            onClick={() => setFocusedUserId(manager.id)}
                        />
                        <button
                            onClick={() => scrollToSection(userSectionRef)}
                            className="h-20 w-px bg-linear-to-b from-primary/30 to-border mt-8 relative group/arrow cursor-pointer hover:bg-primary transition-colors duration-500"
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-white dark:bg-zinc-900 border border-border rounded-full shadow-lg group-hover/arrow:border-primary group-hover/arrow:scale-110 transition-all">
                                <ChevronDown className="w-4 h-4 text-primary" />
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="p-10 border-2 border-dashed border-primary/20 rounded-[3rem] text-center max-w-sm bg-primary/5">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Corporate Apex</p>
                        <p className="text-xs font-bold text-muted-foreground">This node represents the root of the organizational hierarchy.</p>
                    </div>
                )}

                {/* User & Peers Node */}
                <div ref={userSectionRef} className="flex flex-col items-center space-y-16 w-full pt-8 scroll-mt-24">
                    <div className="flex flex-wrap justify-center gap-10 w-full max-w-7xl px-4">
                        {peers.map((peer: any) => (
                            <TeamMemberCard
                                key={peer.id}
                                member={peer}
                                label="Colleague"
                                variant="peer"
                                onClick={() => setFocusedUserId(peer.id)}
                            />
                        ))}
                        <TeamMemberCard member={user} label={focusedUserId ? "Focused Node" : "You"} variant="current" />
                    </div>

                    {subordinates.length > 0 && (
                        <button
                            onClick={() => scrollToSection(subordinatesSectionRef)}
                            className="h-20 w-px bg-linear-to-b from-primary/30 to-border relative group/arrow cursor-pointer hover:bg-primary transition-colors duration-500"
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-white dark:bg-zinc-900 border border-border rounded-full shadow-lg group-hover/arrow:border-primary group-hover/arrow:scale-110 transition-all">
                                <ChevronDown className="w-4 h-4 text-primary" />
                            </div>
                        </button>
                    )}
                </div>

                {/* Subordinates Nodes (Clickable to Drill Down) */}
                {subordinates.length > 0 && (
                    <div ref={subordinatesSectionRef} className="flex flex-wrap justify-center gap-10 w-full max-w-7xl px-4 animate-slide-up bg-linear-to-b from-primary/5 to-transparent py-20 rounded-[5rem] border border-primary/10 relative overflow-hidden mb-12 scroll-mt-24">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48 opacity-50" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -ml-32 -mb-32 opacity-30" />

                        {subordinates.map((sub: any) => (
                            <TeamMemberCard
                                key={sub.id}
                                member={sub}
                                label="Direct Report"
                                variant="subordinate"
                                onClick={() => setFocusedUserId(sub.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function TeamMemberCard({ member, label, variant, onClick }: {
    member: any;
    label: string;
    variant: 'manager' | 'peer' | 'current' | 'subordinate';
    onClick?: () => void;
}) {
    const isCurrent = variant === 'current';

    return (
        <Card
            onClick={!isCurrent ? onClick : undefined}
            className={cn(
                "p-8 w-80 rounded-[3rem] border transition-all duration-700 group relative overflow-hidden",
                isCurrent
                    ? "border-primary bg-primary/10 shadow-3xl shadow-primary/20 scale-110 z-10 ring-1 ring-primary/30"
                    : "border-border/50 bg-card/60 backdrop-blur-md hover:border-primary/50 hover:shadow-2xl hover:-translate-y-4 cursor-pointer"
            )}
        >
            {/* Visual Decoration */}
            {isCurrent && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
            )}

            <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                <div className="relative p-1.5 rounded-[2.5rem] bg-linear-to-br from-primary/30 via-transparent to-transparent">
                    <Avatar className="w-28 h-28 rounded-[2rem] shadow-2xl ring-4 ring-background transition-transform duration-500 group-hover:scale-105">
                        <AvatarImage src={member.profilePictureUrl} className="object-cover" />
                        <AvatarFallback className="bg-linear-to-br from-primary to-primary-foreground text-white font-black text-3xl">
                            {member.firstName[0]}{member.lastName[0]}
                        </AvatarFallback>
                    </Avatar>

                    <div className={cn(
                        "absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] shadow-2xl border transition-all duration-300",
                        variant === 'manager' ? "bg-amber-500 text-white border-amber-400 group-hover:scale-110" :
                            isCurrent ? "bg-primary text-white border-primary/50" :
                                "bg-white dark:bg-zinc-900 text-muted-foreground border-border group-hover:border-primary group-hover:text-primary"
                    )}>
                        {label}
                    </div>
                </div>

                <div className="space-y-3 pt-4 w-full">
                    <h3 className={cn(
                        "text-2xl font-black tracking-tighter truncate px-2 transition-colors duration-300",
                        isCurrent ? "text-primary" : "text-foreground group-hover:text-primary"
                    )}>
                        {member.firstName} {member.lastName}
                    </h3>

                    <div className="flex flex-col items-center space-y-3">
                        <Badge variant="outline" className="rounded-full px-4 py-1.5 border-primary/20 bg-primary/5 text-primary text-[11px] font-black tracking-widest uppercase">
                            <Briefcase className="w-3.5 h-3.5 mr-2 opacity-60" />
                            {member.designation?.name || "Member"}
                        </Badge>

                        <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 transition-colors duration-500 group-hover:text-primary/70">
                            <Building2 className="w-3.5 h-3.5 mr-2" />
                            {member.department?.name || "Organization"}
                        </div>
                    </div>
                </div>

                {/* Action Indicator */}
                {!isCurrent && (
                    <div className="w-full pt-6 border-t border-border/40 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Drill Down</span>
                            <ChevronDown className="w-3 h-3 text-primary animate-bounce" />
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
