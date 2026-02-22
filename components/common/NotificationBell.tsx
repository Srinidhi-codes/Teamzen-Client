"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_MY_NOTIFICATIONS, GET_UNREAD_COUNT } from "@/lib/graphql/notifications/queries";
import { MARK_NOTIFICATION_READ, MARK_ALL_READ, DELETE_NOTIFICATION } from "@/lib/graphql/notifications/mutations";
import Link from "next/link";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { Mail, MailOpen, Trash2 } from "lucide-react";


export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const { data: notificationsData, refetch: refetchNotifications } = useQuery(GET_MY_NOTIFICATIONS) as any;
    const { data: countData, refetch: refetchCount } = useQuery(GET_UNREAD_COUNT) as any;

    // Connect to WebSocket for real-time updates
    useNotifications(() => {
        // Refetch data when a new notification arrives to sync the list
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
        e.stopPropagation(); // Prevent marking as read when deleting
        await deleteNotification({ variables: { id } });
        refetchNotifications();
        refetchCount();
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2.5 rounded-2xl transition-all relative ${isOpen ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-muted-foreground"
                    }`}
            >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-card border border-border rounded-3xl shadow-2xl py-4 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-5 pb-4 border-b border-border/50 flex justify-between items-center bg-muted/20">
                            <div>
                                <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Notifications</p>
                                <p className="text-lg font-black text-foreground">Stay Updated</p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors"
                                >
                                    Mark All Read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            {notifications.length > 0 ? (
                                notifications.map((notif: any) => (
                                    <div
                                        key={notif.id}
                                        className={`px-5 py-4 border-b border-border/30 last:border-0 hover:bg-primary/5 transition-colors cursor-pointer relative group ${!notif.isRead ? "bg-primary/5" : ""
                                            }`}
                                        onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                                    >
                                        {!notif.isRead && (
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                                        )}
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-foreground leading-snug mb-1">
                                                    {notif.message}
                                                </p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div className="shrink-0 flex flex-col items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs group-hover:scale-110 transition-transform">
                                                    {notif.verb === 'approved' ? '✅' :
                                                        notif.verb === 'rejected' ? '❌' :
                                                            notif.isRead ? <MailOpen className="w-4 h-4 text-primary" /> : <Mail className="w-4 h-4 text-primary" />}
                                                </div>
                                                <button
                                                    onClick={(e) => handleDelete(e, notif.id)}
                                                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Delete notification"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-5 py-12 text-center">
                                    <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-4 grayscale">
                                        <span className="text-3xl">🔔</span>
                                    </div>
                                    <p className="text-sm font-bold text-muted-foreground">No notifications yet</p>
                                </div>
                            )}
                        </div>

                        <div className="px-5 pt-3 border-t border-border/50">
                            <Link
                                href="/notifications"
                                className="block w-full py-3 text-center text-xs font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                View All Activity
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
