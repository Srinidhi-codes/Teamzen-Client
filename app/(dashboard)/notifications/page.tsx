"use client";

import { useState, useEffect } from "react";
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
    CheckCheck,
    RotateCcw,
    Calendar,
    UserPlus,
    Award,
    Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import moment from "moment";
import { Pagination } from "@/components/common/Pagination";

export default function NotificationsPage() {
    const [filter, setFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const { data, loading, refetch } = useQuery(GET_MY_NOTIFICATIONS, {
        variables: { 
            level: "personal",
            isRead: filter === "unread" ? false : undefined,
            page: currentPage,
            pageSize: pageSize
        }
    }) as any;
    const { data: activityData, loading: activityLoading, refetch: refetchActivity } = useQuery(GET_USER_ACTIVITIES) as any;
    const { data: countData, refetch: refetchCount } = useQuery(GET_UNREAD_COUNT, {
        variables: { level: "personal" }
    }) as any;

    const [markRead] = useMutation(MARK_NOTIFICATION_READ);
    const [markAllRead] = useMutation(MARK_ALL_READ);
    const [deleteNotif] = useMutation(DELETE_NOTIFICATION);
    const [deleteAllRead] = useMutation(DELETE_ALL_READ_NOTIFICATIONS);

    useNotifications(() => {
        refetch();
        refetchCount();
        refetchActivity();
    }, { silent: true });

    const handleFilterChange = (val: string) => {
        setFilter(val);
        setCurrentPage(1);
    };

    const notifications = data?.myNotifications?.results || [];
    const totalNotificationsCount = data?.myNotifications?.total || 0;
    const unreadCount = countData?.unreadNotificationCount || 0;

    const activities = activityData?.userActivities || [];

    const paginatedNotifications = notifications;
    const totalNotificationPages = Math.ceil(totalNotificationsCount / pageSize);

    const paginatedActivities = activities.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const totalActivityPages = Math.ceil(activities.length / pageSize);

    useEffect(() => {
        const totalPages = filter === "activity" ? totalActivityPages : totalNotificationPages;
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalNotificationPages, totalActivityPages, currentPage, filter]);

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
        if (notif.verb?.includes('approved')) return "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20";
        if (notif.verb?.includes('rejected')) return "bg-destructive/10 hover:bg-destructive/15 border-destructive/20";
        if (notif.verb?.includes('cancelled')) return "bg-blue-500/10 hover:bg-blue-500/15 border-blue-500/20";
        return !notif.isRead ? "bg-primary/5 hover:bg-primary/10 border-primary/20" : "hover:bg-muted/30 border-transparent";
    };

    const renderNotifications = (items: any[]) => (
        <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto custom-scrollbar">
            {items.map((notif: any) => (
                <div
                    key={notif.id}
                    className={cn(
                        "group relative p-4 sm:p-5 transition-colors border-l-4",
                        getBgColor(notif)
                    )}
                >
                    <div className="flex gap-3 sm:gap-4">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            notif.isRead
                                ? "bg-muted/50 text-muted-foreground"
                                : "bg-primary/10 text-primary"
                        )}>
                            {notif.verb === "approved" ? "✅" :
                                notif.verb === "rejected" ? "❌" :
                                    notif.isRead ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex justify-between items-start gap-2">
                                <h4 className={cn(
                                    "text-sm font-medium leading-relaxed line-clamp-2",
                                    notif.isRead ? "text-muted-foreground" : "text-foreground"
                                )}>
                                    {notif.message}
                                </h4>
                                <div className="flex items-center gap-0.5 shrink-0">
                                    {!notif.isRead && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleMarkRead(notif.id)}
                                            className="h-8 w-8 rounded-md hover:bg-emerald-500/10 hover:text-emerald-600"
                                            title="Mark as read"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(notif.id)}
                                        className="h-8 w-8 rounded-md hover:bg-destructive/10 hover:text-destructive opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    {moment(notif.createdAt).format("MMM DD, YYYY HH:mm A")}
                                </div>
                                <div className="flex items-center gap-1.5 capitalize">
                                    <span className="text-border">·</span>
                                    {notif.actor?.firstName || "System"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="p-4 sm:p-8 space-y-6 animate-fade-in mx-auto">
            <PageHeader
                title="Notifications"
                description="Updates about approvals, requests, and account activity."
                actions={
                    <div className="flex items-center gap-2 w-full lg:w-auto">
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleMarkAllRead}
                                className="flex-1 lg:flex-none h-9 rounded-md text-sm font-medium"
                            >
                                <CheckCheck className="w-4 h-4 mr-2" />
                                Mark all read
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                refetch();
                                refetchActivity();
                            }}
                            className="rounded-md h-9 w-9"
                            title="Refresh"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-5 bg-primary/5 border-primary/10 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-background rounded-md text-primary">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">Total</p>
                            <p className="text-xl font-semibold">{totalNotificationsCount}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 bg-orange-500/5 border-orange-500/10 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-background rounded-md text-orange-500">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">Unread</p>
                            <p className="text-xl font-semibold">{unreadCount}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 bg-emerald-500/5 border-emerald-500/10 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-background rounded-md text-emerald-500">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">Activity</p>
                            <p className="text-xl font-semibold">{activities.length}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="rounded-xl border-border overflow-hidden min-h-[500px]">
                <Tabs defaultValue="all" onValueChange={handleFilterChange} className="w-full">
                    <div className="px-4 sm:px-6 pt-5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-border/40 pb-5">
                        <TabsList className="bg-muted/50 p-1 rounded-md w-full sm:w-auto">
                            <TabsTrigger value="all" className="rounded-md px-4 py-1.5 text-sm font-medium">
                                All
                            </TabsTrigger>
                            <TabsTrigger value="unread" className="rounded-md px-4 py-1.5 text-sm font-medium">
                                Unread
                                {unreadCount > 0 && (
                                    <span className="ml-2 rounded-md px-1.5 py-0.5 text-[11px] font-medium bg-destructive text-destructive-foreground">
                                        {unreadCount}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="activity" className="rounded-md px-4 py-1.5 text-sm font-medium">
                                Activity
                            </TabsTrigger>
                        </TabsList>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDeleteAllRead}
                            disabled={totalNotificationsCount === unreadCount}
                            className="text-muted-foreground hover:text-destructive h-9 rounded-md text-sm font-medium px-3"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear read
                        </Button>
                    </div>

                    <TabsContent value="activity" className="m-0 border-none outline-none pb-6">
                        {activityLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-3">
                                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="text-sm text-muted-foreground">Loading…</p>
                            </div>
                        ) : activities.length > 0 ? (
                            <>
                                <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto custom-scrollbar">
                                    {paginatedActivities.map((item: any) => {
                                        const isLeave = item.id.includes('leave');
                                        const isNotif = item.id.includes('notif');
                                        const isJoin = item.action.toLowerCase().includes('joined');
                                        const isAnniv = item.action.toLowerCase().includes('celebrates');
                                        const Icon = isLeave ? Calendar : isNotif ? Bell : isJoin ? UserPlus : isAnniv ? Award : Clock;
                                        const color = isAnniv ? 'text-amber-500' : isJoin ? 'text-blue-500' : isLeave ? 'text-blue-600' : 'text-primary';
                                        const bg = isAnniv ? 'bg-amber-500/10' : isJoin ? 'bg-blue-500/10' : isLeave ? 'bg-blue-500/10' : 'bg-primary/10';

                                        return (
                                            <div key={item.id} className="group relative p-4 sm:p-5 transition-colors hover:bg-muted/30">
                                                <div className="flex gap-3 sm:gap-4">
                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg, color)}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        <h4 className="text-sm font-medium leading-relaxed text-foreground capitalize truncate">
                                                            {item.action}
                                                        </h4>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="w-3 h-3" />
                                                                {moment(item.time).format("MMM DD, HH:mm")}
                                                            </div>
                                                            <span className="text-border">·</span>
                                                            <span>{item.user}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {totalActivityPages > 1 && (
                                    <div className="px-6 pt-2">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalActivityPages}
                                            onPageChange={setCurrentPage}
                                            total={activities.length}
                                            pageSize={pageSize}
                                            label="activities"
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                                <Activity className="w-10 h-10 text-muted-foreground/40 mb-4" />
                                <h3 className="text-base font-semibold text-foreground mb-2">No activity yet</h3>
                                <p className="text-sm text-muted-foreground max-w-xs">
                                    Recent account activity will show up here.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="all" className="p-0 m-0 pb-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-3">
                                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="text-sm text-muted-foreground">Loading…</p>
                            </div>
                        ) : notifications.length > 0 ? (
                            <>
                                {renderNotifications(paginatedNotifications)}
                                {totalNotificationPages > 1 && (
                                    <div className="px-6 pt-2">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalNotificationPages}
                                            onPageChange={setCurrentPage}
                                            total={totalNotificationsCount}
                                            pageSize={pageSize}
                                            label="notifications"
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                                <Bell className="w-10 h-10 text-muted-foreground/40 mb-4" />
                                <h3 className="text-base font-semibold text-foreground mb-2">No notifications</h3>
                                <p className="text-sm text-muted-foreground max-w-xs">
                                    You&apos;re all caught up. New alerts will appear here.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="unread" className="p-0 m-0 pb-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-3">
                                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="text-sm text-muted-foreground">Loading…</p>
                            </div>
                        ) : notifications.length > 0 ? (
                            <>
                                {renderNotifications(paginatedNotifications)}
                                {totalNotificationPages > 1 && (
                                    <div className="px-6 pt-2">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalNotificationPages}
                                            onPageChange={setCurrentPage}
                                            total={totalNotificationsCount}
                                            pageSize={pageSize}
                                            label="notifications"
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                                <Bell className="w-10 h-10 text-muted-foreground/40 mb-4" />
                                <h3 className="text-base font-semibold text-foreground mb-2">No unread notifications</h3>
                                <p className="text-sm text-muted-foreground max-w-xs">
                                    You&apos;re all caught up.
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </Card>

            <div className="text-center pb-8">
                <p className="text-xs text-muted-foreground">
                    Privacy policy · Terms of service · Help center
                </p>
            </div>
        </div>
    );
}
