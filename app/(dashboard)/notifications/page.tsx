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

    const renderNotifications = (items: any[]) => (
        <div className="divide-y divide-border/30">
            {items.map((notif: any) => (
                <div
                    key={notif.id}
                    className={cn(
                        "group relative p-6 transition-all duration-300 hover:bg-primary/5",
                        !notif.isRead && "bg-primary/5"
                    )}
                >
                    <div className="flex gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105",
                            notif.isRead
                                ? "bg-muted/50 text-muted-foreground"
                                : "bg-primary/10 text-primary shadow-lg shadow-primary/5"
                        )}>
                            {notif.verb === "approved" ? "✅" :
                                notif.verb === "rejected" ? "❌" :
                                    notif.isRead ? <MailOpen className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                        </div>

                        <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start gap-4">
                                <h4 className={cn(
                                    "text-sm font-bold leading-relaxed max-w-md",
                                    notif.isRead ? "text-muted-foreground" : "text-foreground"
                                )}>
                                    {notif.message}
                                </h4>
                                <div className="flex items-center gap-1">
                                    {!notif.isRead && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleMarkRead(notif.id)}
                                            className="h-8 w-8 rounded-full hover:bg-emerald-500/10 hover:text-emerald-500"
                                            title="Mark as read"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(notif.id)}
                                        className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    {moment(notif.createdAt).format("MMM DD, YYYY HH:mm A")}
                                </div>
                                <div className="flex items-center gap-1.5 capitalize">
                                    <div className="w-1 h-1 rounded-full bg-border" />
                                    From: {notif.actor?.firstName || "System"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="p-4 sm:p-8 space-y-8 animate-fade-in max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground mb-2">Notifications Center</h1>
                    <p className="text-muted-foreground font-medium">Manage your system updates and alerts</p>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="rounded-full font-bold uppercase tracking-widest text-[10px] h-9"
                        >
                            <CheckCheck className="w-3.5 h-3.5 mr-2" />
                            Mark All Read
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            refetch();
                            refetchActivity();
                        }}
                        className="rounded-full"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-6 bg-primary/5 border-primary/10 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm">
                            <Bell className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Total</p>
                            <p className="text-2xl font-black">{notifications.length}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-orange-500/5 border-orange-500/10 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm text-orange-500">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Unread</p>
                            <p className="text-2xl font-black">{unreadCount}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-emerald-500/5 border-emerald-500/10 rounded-3xl relative overflow-hidden group col-span-1 sm:col-span-2 lg:col-span-1">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm text-emerald-500">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Activities</p>
                            <p className="text-2xl font-black">{activities.length}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content */}
            <Card className="rounded-4xl border-border/40 bg-card/30 backdrop-blur-xl overflow-hidden min-h-[500px]">
                <Tabs defaultValue="all" onValueChange={setFilter} className="w-full">
                    <div className="px-6 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-6">
                        <TabsList className="bg-muted/50 p-1 rounded-2xl">
                            <TabsTrigger value="all" className="rounded-xl px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-zinc-900">
                                All
                            </TabsTrigger>
                            <TabsTrigger value="unread" className="rounded-xl px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-zinc-900">
                                Unread
                                {unreadCount > 0 && (
                                    <Badge variant="destructive" className="ml-2 rounded-full px-1.5 h-4 text-[9px]">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="activity" className="rounded-xl px-6 py-2 font-bold data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-zinc-900">
                                Activity
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDeleteAllRead}
                                disabled={!notifications.some((n: any) => n.isRead)}
                                className="text-muted-foreground hover:text-destructive rounded-full text-xs font-bold"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear Read
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="activity">
                        {activityLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Fetching Activity Logs...</p>
                            </div>
                        ) : activities.length > 0 ? (
                            <div className="divide-y divide-border/30">
                                {activities.map((item: any) => {
                                    const isLeave = item.id.includes('leave');
                                    const isNotif = item.id.includes('notif');
                                    const isJoin = item.action.toLowerCase().includes('joined');
                                    const isAnniv = item.action.toLowerCase().includes('celebrates');
                                    const Icon = isLeave ? Calendar : isNotif ? Zap : isJoin ? UserPlus : isAnniv ? Award : Clock;
                                    const color = isAnniv ? 'text-amber-500' : isJoin ? 'text-blue-500' : isLeave ? 'text-blue-600' : 'text-primary';
                                    const bg = isAnniv ? 'bg-amber-500/10' : isJoin ? 'bg-blue-500/10' : isLeave ? 'bg-blue-500/10' : 'bg-primary/10';

                                    return (
                                        <div key={item.id} className="group relative p-6 transition-all duration-300 hover:bg-muted/30">
                                            <div className="flex gap-4">
                                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105", bg, color)}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <h4 className="text-sm font-bold leading-relaxed text-foreground capitalize">
                                                            {item.action}
                                                        </h4>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                        <Clock className="w-3 h-3" />
                                                        {moment(item.time).format("MMM DD, YYYY HH:mm A")}
                                                        <div className="w-1 h-1 rounded-full bg-border" />
                                                        By: {item.user}
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
