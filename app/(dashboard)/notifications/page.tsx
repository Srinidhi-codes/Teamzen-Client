"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_MY_NOTIFICATIONS, GET_UNREAD_COUNT } from "@/lib/graphql/notifications/queries";
import {
    MARK_NOTIFICATION_READ,
    MARK_ALL_READ,
    DELETE_NOTIFICATION,
    DELETE_ALL_READ_NOTIFICATIONS
} from "@/lib/graphql/notifications/mutations";
import { GET_USER_ACTIVITIES } from "@/lib/graphql/dashboard/queries";
import {
    Bell,
    Mail,
    MailOpen,
    Trash2,
    CheckCircle2,
    Clock,
    Filter,
    MoreVertical,
    X,
    Search,
    CheckCheck,
    RotateCcw,
    Zap,
    Calendar,
    UserPlus,
    Award,
    Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import moment from "moment";

export default function NotificationsPage() {
    const [filter, setFilter] = useState("all");
    const { data, loading, refetch } = useQuery(GET_MY_NOTIFICATIONS, {
        variables: { level: "personal" }
    }) as any;
    const { data: activityData, loading: activityLoading, refetch: refetchActivity } = useQuery(GET_USER_ACTIVITIES) as any;
    const { data: countData, refetch: refetchCount } = useQuery(GET_UNREAD_COUNT, {
        variables: { level: "personal" }
    }) as any;

    const [markRead] = useMutation(MARK_NOTIFICATION_READ);
    const [markAllRead] = useMutation(MARK_ALL_READ);
    const [deleteNotif] = useMutation(DELETE_NOTIFICATION);
    const [deleteAllRead] = useMutation(DELETE_ALL_READ_NOTIFICATIONS);

    // Real-time updates
    useNotifications(() => {
        refetch();
        refetchCount();
        refetchActivity();
    });

    const notifications = data?.myNotifications || [];
    const unreadCount = countData?.unreadNotificationCount || 0;

    const filteredNotifications = filter === "unread"
        ? notifications.filter((n: any) => !n.isRead)
        : notifications;

    const activities = activityData?.userActivities || [];

    const handleMarkRead = async (id: string) => {
        await markRead({ variables: { id } });
        refetch();
        refetchCount();
    };

    const handleMarkAllRead = async () => {
        await markAllRead();
        refetch();
        refetchCount();
    };

    const handleDelete = async (id: string) => {
        await deleteNotif({ variables: { id } });
        refetch();
        refetchCount();
    };

    const handleDeleteAllRead = async () => {
        if (confirm("Are you sure you want to delete all read notifications?")) {
            await deleteAllRead();
            refetch();
            refetchCount();
        }
    };

    const getBgColor = (notif: any) => {
        if (notif.verb?.includes('approved')) return "bg-emerald-500/10 hover:bg-emerald-500/20 shadow-lg shadow-emerald-500/5 border-emerald-500/20";
        if (notif.verb?.includes('rejected')) return "bg-destructive/10 hover:bg-destructive/20 shadow-lg shadow-destructive/5 border-destructive/20";
        if (notif.verb?.includes('cancelled')) return "bg-blue-500/10 hover:bg-blue-500/20 shadow-lg shadow-blue-500/5 border-blue-500/20";
        return !notif.isRead ? "bg-primary/5 hover:bg-primary/10 border-primary/20" : "hover:bg-muted/30 border-transparent";
    };

    const renderNotifications = (items: any[]) => (
        <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto custom-scrollbar">
            {items.map((notif: any) => (
                <div
                    key={notif.id}
                    className={cn(
                        "group relative p-4 sm:p-6 transition-all duration-300 border-l-4",
                        getBgColor(notif)
                    )}
                >
                    <div className="flex gap-3 sm:gap-4">
                        <div className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                            notif.isRead
                                ? "bg-muted/50 text-muted-foreground"
                                : "bg-primary/10 text-primary shadow-lg shadow-primary/5"
                        )}>
                            {notif.verb === "approved" ? "✅" :
                                notif.verb === "rejected" ? "❌" :
                                    notif.isRead ? <MailOpen className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mail className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex justify-between items-start gap-2">
                                <h4 className={cn(
                                    "text-xs sm:text-sm font-bold leading-relaxed line-clamp-2",
                                    notif.isRead ? "text-muted-foreground" : "text-foreground"
                                )}>
                                    {notif.message}
                                </h4>
                                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                                    {!notif.isRead && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleMarkRead(notif.id)}
                                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-emerald-500/10 hover:text-emerald-500"
                                            title="Mark as read"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(notif.id)}
                                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-destructive/10 hover:text-destructive opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    {moment(notif.createdAt).format("MMM DD, YYYY HH:mm A")}
                                </div>
                                <div className="flex items-center gap-1.5 capitalize">
                                    <div className="w-1 h-1 rounded-full bg-border" />
                                    By: {notif.actor?.firstName || "System"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-fade-in max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground leading-none">
                        Notifications Center
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                        Manage your system updates and activity alerts.
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="flex-1 sm:flex-none rounded-2xl font-bold uppercase tracking-widest text-[9px] h-10 border-primary/20 hover:bg-primary/5"
                        >
                            <CheckCheck className="w-3.5 h-3.5 mr-2" />
                            Mark All Read
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            refetch();
                            refetchActivity();
                        }}
                        className="rounded-xl h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all active:rotate-180 duration-500"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-5 sm:p-6 bg-primary/5 border-primary/10 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative flex items-center gap-4">
                        <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm text-primary">
                            <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">Total</p>
                            <p className="text-xl sm:text-2xl font-black">{notifications.length}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 sm:p-6 bg-orange-500/5 border-orange-500/10 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative flex items-center gap-4">
                        <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm text-orange-500">
                            <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-0.5">Unread</p>
                            <p className="text-xl sm:text-2xl font-black">{unreadCount}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 sm:p-6 bg-emerald-500/5 border-emerald-500/10 rounded-3xl relative overflow-hidden group col-span-1 sm:col-span-2 lg:col-span-1">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative flex items-center gap-4">
                        <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm text-emerald-500">
                            <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Activities</p>
                            <p className="text-xl sm:text-2xl font-black">{activities.length}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content */}
            <Card className="rounded-3xl sm:rounded-4xl border-border/40 bg-card/30 backdrop-blur-xl overflow-hidden min-h-[500px]">
                <Tabs defaultValue="all" onValueChange={setFilter} className="w-full">
                    <div className="px-4 sm:px-6 pt-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-border/40 pb-6">
                        <TabsList className="bg-muted/50 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar flex shrink-0">
                            <TabsTrigger value="all" className="flex-1 sm:flex-none rounded-xl px-4 sm:px-6 py-2 font-bold data-[state=active]:bg-primary/50 data-[state=active]:shadow-lg dark:data-[state=active]:bg-zinc-900">
                                All
                            </TabsTrigger>
                            <TabsTrigger value="unread" className="flex-1 sm:flex-none rounded-xl px-4 sm:px-6 py-2 font-bold data-[state=active]:bg-primary/50 data-[state=active]:shadow-lg dark:data-[state=active]:bg-zinc-900">
                                Unread
                                {unreadCount > 0 && (
                                    <Badge variant="destructive" className="ml-2 rounded-full px-1.5 h-4 text-[9px] shrink-0">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="activity" className="flex-1 sm:flex-none rounded-xl px-4 sm:px-6 py-2 font-bold data-[state=active]:bg-primary/50 data-[state=active]:shadow-lg dark:data-[state=active]:bg-zinc-900">
                                Activity
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2 justify-between w-full sm:w-auto shrink-0">
                            <div className="xl:hidden" /> {/* Spacer for symmetry on mobile if needed */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDeleteAllRead}
                                disabled={!notifications.some((n: any) => n.isRead)}
                                className="text-muted-foreground hover:text-destructive rounded-full text-[10px] font-black uppercase tracking-widest h-10 px-4"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear Read
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="activity" className="m-0 border-none outline-none">
                        {activityLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Fetching Activity Logs...</p>
                            </div>
                        ) : activities.length > 0 ? (
                            <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto custom-scrollbar">
                                {activities.map((item: any) => {
                                    const isLeave = item.id.includes('leave');
                                    const isNotif = item.id.includes('notif');
                                    const isJoin = item.action.toLowerCase().includes('joined');
                                    const isAnniv = item.action.toLowerCase().includes('celebrates');
                                    const Icon = isLeave ? Calendar : isNotif ? Zap : isJoin ? UserPlus : isAnniv ? Award : Clock;
                                    const color = isAnniv ? 'text-amber-500' : isJoin ? 'text-blue-500' : isLeave ? 'text-blue-600' : 'text-primary';
                                    const bg = isAnniv ? 'bg-amber-500/10' : isJoin ? 'bg-blue-500/10' : isLeave ? 'bg-blue-500/10' : 'bg-primary/10';

                                    return (
                                        <div key={item.id} className="group relative p-4 sm:p-6 transition-all duration-300 hover:bg-muted/30">
                                            <div className="flex gap-3 sm:gap-4">
                                                <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", bg, color)}>
                                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h4 className="text-xs sm:text-sm font-bold leading-relaxed text-foreground capitalize truncate">
                                                            {item.action}
                                                        </h4>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                            {moment(item.time).format("MMM DD, HH:mm")}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-1 h-1 rounded-full bg-border" />
                                                            By: {item.user}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                                <div className="w-20 h-20 bg-muted/50 rounded-3xl flex items-center justify-center mb-6 opacity-50 grayscale group">
                                    <Activity className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-black text-foreground mb-2">No activity found</h3>
                                <p className="text-sm font-medium text-muted-foreground max-w-xs">
                                    We couldn't find any recent activities for your account.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="all" className="p-0 m-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Fetching Notifications...</p>
                            </div>
                        ) : filteredNotifications.length > 0 ? (
                            renderNotifications(filteredNotifications)
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                                <div className="w-20 h-20 bg-muted/50 rounded-3xl flex items-center justify-center mb-6 opacity-50 grayscale group">
                                    <Bell className="w-10 h-10 text-muted-foreground group-hover:rotate-12 transition-transform" />
                                </div>
                                <h3 className="text-lg font-black text-foreground mb-2">No notifications found</h3>
                                <p className="text-sm font-medium text-muted-foreground max-w-xs">
                                    You're all caught up! When you have new alerts, they will appear here.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="unread" className="p-0 m-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Fetching Notifications...</p>
                            </div>
                        ) : filteredNotifications.length > 0 ? (
                            renderNotifications(filteredNotifications)
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                                <div className="w-20 h-20 bg-muted/50 rounded-3xl flex items-center justify-center mb-6 opacity-50 grayscale group">
                                    <Bell className="w-10 h-10 text-muted-foreground group-hover:rotate-12 transition-transform" />
                                </div>
                                <h3 className="text-lg font-black text-foreground mb-2">No notifications found</h3>
                                <p className="text-sm font-medium text-muted-foreground max-w-xs">
                                    You're all caught up! When you have new alerts, they will appear here.
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </Card>

            {/* Policy Link */}
            <div className="text-center pb-8">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Privacy Policy • Terms of Service • Help Center
                </p>
            </div>
        </div>
    );
}
