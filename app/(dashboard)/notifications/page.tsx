"use client";

import { useState, useEffect, useRef } from "react";
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
    Activity,
    Image as ImageIcon,
    Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import moment from "moment";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { EmptyImages } from "@/lib/brand-images";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnnouncementModal, AnnouncementItem } from "@/components/common/AnnouncementModal";
import { EmailList } from "@/components/email/EmailList";
import { PageSkeleton } from "@/components/common/PageSkeleton";

export default function NotificationsPage() {
    const [filter, setFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [selectedNotif, setSelectedNotif] = useState<any>(null);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);

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

    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    useNotifications((msg) => {
        if (!msg) return;
        if (msg.level === 'personal' || msg.level === 'admin' || msg.verb === 'announcement') {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
                refetch();
                refetchCount();
                refetchActivity();
            }, 400);
        }
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

    const renderNotifications = (items: any[]) => (
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar p-1">
            <EmailList 
                items={items}
                onItemClick={(notif) => {
                    if (notif.verb === "announcement") {
                        setSelectedAnnouncement(notif);
                        if (!notif.isRead) handleMarkRead(notif.id);
                    } else {
                        setSelectedNotif(notif);
                        if (!notif.isRead) handleMarkRead(notif.id);
                    }
                }}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
            />
        </div>
    );

    return (
        <div className="w-full space-y-6 animate-fade-in pb-20">
            <PageHeader
                eyebrow="Updates"
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
                <Card className="p-4 border border-border/70 bg-card rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg text-primary">
                            <Bell className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">Total</p>
                            <p className="text-lg font-semibold tabular-nums">{totalNotificationsCount}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border border-border/70 bg-card rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg text-foreground">
                            <Mail className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">Unread</p>
                            <p className="text-lg font-semibold tabular-nums">{unreadCount}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border border-border/70 bg-card rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg text-foreground">
                            <Activity className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">Activity</p>
                            <p className="text-lg font-semibold tabular-nums">{activities.length}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Tabs defaultValue="all" onValueChange={handleFilterChange} className="w-full space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                    <TabsList className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/80 w-full sm:w-fit flex-wrap sm:flex-nowrap h-auto gap-1">
                        <TabsTrigger
                            value="all"
                            className="group flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:font-semibold data-[state=active]:border data-[state=active]:border-border/40"
                        >
                            <Bell className="w-3.5 h-3.5 group-data-[state=active]:text-primary" />
                            <span>All</span>
                            {totalNotificationsCount > 0 && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-mono">
                                    {totalNotificationsCount}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="unread"
                            className="group flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:font-semibold data-[state=active]:border data-[state=active]:border-border/40"
                        >
                            <Mail className="w-3.5 h-3.5 group-data-[state=active]:text-primary" />
                            <span>Unread</span>
                            {unreadCount > 0 && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-mono">
                                    {unreadCount}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="activity"
                            className="group flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs data-[state=active]:font-semibold data-[state=active]:border data-[state=active]:border-border/40"
                        >
                            <Activity className="w-3.5 h-3.5 group-data-[state=active]:text-primary" />
                            <span>Activity</span>
                            {activities.length > 0 && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-mono">
                                    {activities.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteAllRead}
                        disabled={totalNotificationsCount === unreadCount}
                        className="text-muted-foreground hover:text-destructive h-8 rounded-lg text-xs font-medium px-3"
                    >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        Clear read
                    </Button>
                </div>

                <TabsContent value="activity" className="m-0 border-none outline-none">
                    {activityLoading ? (
                        <PageSkeleton variant="list" />
                    ) : activities.length > 0 ? (
                        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden">
                            <div className="divide-y divide-border/30 max-h-150 overflow-y-auto custom-scrollbar">
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
                                <div className="p-6 border-t border-border/30 bg-muted/10">
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
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border/60 bg-card flex flex-col items-center justify-center py-24 px-6 text-center shadow-xs">
                            <Activity className="w-10 h-10 text-muted-foreground/40 mb-4" />
                            <h3 className="text-base font-semibold text-foreground mb-2">No activity yet</h3>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                Recent account activity will show up here.
                            </p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="all" className="p-0 m-0">
                    {loading ? (
                        <PageSkeleton variant="list" />
                    ) : notifications.length > 0 ? (
                        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden">
                            {renderNotifications(paginatedNotifications)}
                            {totalNotificationPages > 1 && (
                                <div className="p-6 border-t border-border/30 bg-muted/10">
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
                        </div>
                    ) : (
                        <EmptyState
                            src={EmptyImages.notifications}
                            title="No notifications"
                            description="You're all caught up. New alerts will appear here."
                            size="wide"
                        />
                    )}
                </TabsContent>

                <TabsContent value="unread" className="p-0 m-0">
                    {loading ? (
                        <PageSkeleton variant="list" />
                    ) : notifications.length > 0 ? (
                        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden">
                            {renderNotifications(paginatedNotifications)}
                            {totalNotificationPages > 1 && (
                                <div className="p-6 border-t border-border/30 bg-muted/10">
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
                        </div>
                    ) : (
                        <EmptyState
                            src={EmptyImages.notifications}
                            title="No unread notifications"
                            description="You're all caught up."
                            size="wide"
                        />
                    )}
                </TabsContent>
            </Tabs>

            <div className="text-center pb-8">
                <p className="text-xs text-muted-foreground">
                    Privacy policy · Terms of service · Help center
                </p>
            </div>

            <Dialog open={!!selectedNotif} onOpenChange={(open) => !open && setSelectedNotif(null)}>
                <DialogContent className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 bottom-auto w-[min(94vw,36rem)] max-w-xl max-h-[85dvh] overflow-y-auto p-5 sm:p-6 rounded-2xl shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="capitalize text-lg">{selectedNotif?.verb || "Notification"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {selectedNotif?.message}
                        </p>
                        {selectedNotif?.imageUrl && (
                            <div className="mt-4 rounded-md overflow-hidden border border-border">
                                <img 
                                    src={selectedNotif.imageUrl} 
                                    alt="Attachment" 
                                    className="w-full max-h-[400px] object-cover" 
                                />
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-4 border-t border-border">
                            <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {selectedNotif ? moment(selectedNotif.createdAt).format("MMM DD, YYYY HH:mm A") : ""}
                            </div>
                            <span>·</span>
                            <div>From: {selectedNotif?.actor?.firstName || "System"}</div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AnnouncementModal
                isOpen={!!selectedAnnouncement}
                announcement={selectedAnnouncement}
                onClose={() => setSelectedAnnouncement(null)}
            />
        </div>
    );
}
