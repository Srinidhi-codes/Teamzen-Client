"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_MY_NOTIFICATIONS, GET_UNREAD_COUNT } from "@/lib/graphql/notifications/queries";
import { MARK_NOTIFICATION_READ, MARK_ALL_READ, DELETE_NOTIFICATION } from "@/lib/graphql/notifications/mutations";
import Link from "next/link";
import { useNotifications } from "@/lib/hooks/useNotifications";
import {
    Bell,
    Mail,
    MailOpen,
    Trash2,
    CheckCircle2,
    XCircle,
    ArrowRight,
    BellRing
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import moment from "moment";


export function NotificationBell() {
    const router = useRouter();
    const { data: notificationsData, refetch: refetchNotifications } = useQuery(GET_MY_NOTIFICATIONS, {
        variables: { level: 'personal' }
    }) as any;
    const { data: countData, refetch: refetchCount } = useQuery(GET_UNREAD_COUNT, {
        variables: { level: 'personal' }
    }) as any;

    // Connect to WebSocket for real-time updates
    useNotifications(() => {
        refetchNotifications();
        refetchCount();
    });

    const [markRead] = useMutation(MARK_NOTIFICATION_READ);
    const [markAllRead] = useMutation(MARK_ALL_READ);
    const [deleteNotification] = useMutation(DELETE_NOTIFICATION);

    const notifications = notificationsData?.myNotifications || [];
    const unreadCount = countData?.unreadNotificationCount || 0;

    const handleMarkRead = async (id: string) => {
        await markRead({ variables: { id } });
        refetchNotifications();
        refetchCount();
    };

    const handleMarkAllRead = async () => {
        await markAllRead();
        refetchNotifications();
        refetchCount();
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        await deleteNotification({ variables: { id } });
        refetchNotifications();
        refetchCount();
    };

    const getIcon = (notif: any) => {
        if (notif.verb === 'approved') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
        if (notif.verb === 'rejected') return <XCircle className="w-4 h-4 text-destructive" />;
        return notif.isRead ? <MailOpen className="w-4 h-4 text-primary/60" /> : <Mail className="w-4 h-4 text-primary" />;
    };

    const getBgColor = (notif: any) => {
        if (notif.verb === 'approved') return "bg-emerald-500/10 hover:bg-emerald-500/20";
        if (notif.verb === 'rejected') return "bg-destructive/10 hover:bg-destructive/20";
        if (notif.verb === 'cancelled') return "bg-blue-500/10 hover:bg-blue-500/20";
        return !notif.isRead ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30";
    };

    const handleRedirect = (notif: any) => {
        if (notif.targetType === 'Leave Request') {
            !notif.isRead && handleMarkRead(notif.id);
            router.push(`/leaves`);
        }
        if (notif.targetType === 'Attendance Correction') {
            !notif.isRead && handleMarkRead(notif.id);
            router.push(`/attendance/attendance-correction`);
        }
        if (notif.targetType === 'Payroll') {
            !notif.isRead && handleMarkRead(notif.id);
            router.push(`/payroll`);
        }
    }

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <button
                    className="p-2.5 rounded-2xl transition-all relative hover:bg-primary/10 text-muted-foreground hover:text-primary active:scale-95 group"
                >
                    {unreadCount > 0 ? (
                        <BellRing className="w-6 h-6 animate-pulse" />
                    ) : (
                        <Bell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    )}
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background shadow-lg">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-[calc(100vw-20px)] sm:w-96 p-0 overflow-hidden border-border/50 bg-card/80 backdrop-blur-2xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200"
            >
                <DropdownMenuLabel className="p-0">
                    <div className="px-4 sm:px-5 py-4 flex justify-between items-center bg-linear-to-b from-primary/10 to-transparent">
                        <div>
                            <p className="text-[8px] sm:text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">Notifications</p>
                            <p className="text-base sm:text-lg font-black text-foreground">Stay Updated</p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-[9px] sm:text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors py-1.5 px-3 hover:bg-primary/5 rounded-xl border border-border sm:border-transparent"
                            >
                                Mark All Read
                            </button>
                        )}
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="m-0 opacity-50" />

                <div className="max-h-[60vh] sm:max-h-[420px] overflow-y-auto no-scrollbar py-1">
                    {notifications.length > 0 ? (
                        notifications.map((notif: any) => (
                            <DropdownMenuItem
                                key={notif.id}
                                className={cn(
                                    "px-4 sm:px-5 py-3 sm:py-4 transition-colors cursor-pointer relative group flex items-start gap-3 sm:gap-4 mb-1 sm:mb-2 mx-1 rounded-2xl",
                                    getBgColor(notif)
                                )}
                                onClick={() => handleRedirect(notif)}
                            >
                                <div className="shrink-0 relative">
                                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        {getIcon(notif)}
                                    </div>
                                    {!notif.isRead && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background shadow-sm" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-sm leading-snug mb-1 line-clamp-2",
                                        notif.isRead ? "text-muted-foreground font-medium" : "text-foreground font-bold"
                                    )}>
                                        {notif.message}
                                    </p>
                                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                        {moment(notif.createdAt).format("MMM DD, YYYY HH:mm A")}
                                    </p>
                                </div>

                                <div className="shrink-0 flex items-center h-10">
                                    <button
                                        onClick={(e) => handleDelete(e, notif.id)}
                                        className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                        title="Delete notification"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="px-5 py-12 text-center">
                            <div className="w-20 h-20 bg-linear-to-b from-muted/20 to-transparent rounded-3xl flex items-center justify-center mx-auto mb-4 border border-border/50">
                                <Bell className="w-10 h-10 text-muted-foreground/30" />
                            </div>
                            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No notifications yet</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">We'll alert you when something happens</p>
                        </div>
                    )}
                </div>

                <DropdownMenuSeparator className="m-0 opacity-50" />

                <div className="p-3 bg-muted/5">
                    <Link
                        href="/notifications"
                        className="group flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-linear-to-b from-transparent to-primary/5 hover:to-primary/10 transition-all border border-transparent hover:border-primary/10"
                    >
                        <span className="text-[10px] font-black text-muted-foreground group-hover:text-primary uppercase tracking-widest transition-colors">
                            View All Activity
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
