import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
    CheckCircle2, 
    Trash2, 
    Megaphone, 
    CheckCircle, 
    XCircle,
    Image as ImageIcon,
    MailOpen,
    Mail
} from "lucide-react";
import moment from "moment";

export interface EmailCardProps {
    id: string;
    verb: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    actor?: {
        firstName?: string;
        lastName?: string;
    };
    imageUrl?: string;
    onClick: () => void;
    onMarkRead?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export function EmailCard({
    id,
    verb,
    message,
    isRead,
    createdAt,
    actor,
    imageUrl,
    onClick,
    onMarkRead,
    onDelete,
}: EmailCardProps) {
    const isAnnouncement = verb === "announcement";
    
    // Determine status colors and icons based on professional semantics
    const getStatusConfig = () => {
        if (verb?.includes('approved')) {
            return {
                icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
                bg: "bg-emerald-50",
                indicator: "bg-emerald-500"
            };
        }
        if (verb?.includes('rejected')) {
            return {
                icon: <XCircle className="w-4 h-4 text-red-600" />,
                bg: "bg-red-50",
                indicator: "bg-red-500"
            };
        }
        if (isAnnouncement) {
            return {
                icon: <Megaphone className="w-4 h-4 text-blue-600" />,
                bg: "bg-blue-50",
                indicator: "bg-blue-500"
            };
        }
        return {
            icon: isRead ? <MailOpen className="w-4 h-4 text-slate-400" /> : <Mail className="w-4 h-4 text-slate-600" />,
            bg: "bg-slate-50",
            indicator: "bg-primary"
        };
    };

    const config = getStatusConfig();
    const senderName = actor?.firstName ? `${actor.firstName} ${actor.lastName || ''}`.trim() : "System";

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative flex items-start gap-4 p-4 transition-all duration-200 cursor-pointer border-b border-border/40 hover:bg-muted/40",
                !isRead && "bg-muted/10"
            )}
        >
            {/* Unread Indicator */}
            {!isRead && (
                <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", config.indicator)} />
            )}

            {/* Avatar / Icon */}
            <div className="shrink-0 pt-1">
                <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border border-border/50 shadow-sm",
                    !isRead ? config.bg : "bg-transparent border-transparent"
                )}>
                    {config.icon}
                </div>
            </div>

            {/* Content */}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                        <span className={cn(
                            "truncate font-medium text-sm",
                            !isRead ? "text-foreground font-semibold" : "text-muted-foreground"
                        )}>
                            {senderName}
                        </span>
                        {isAnnouncement && (
                            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                Announcement
                            </span>
                        )}
                    </div>
                    <time className={cn(
                        "shrink-0 text-xs",
                        !isRead ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                        {moment(createdAt).format("MMM D, h:mm A")}
                    </time>
                </div>

                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <p className={cn(
                            "text-sm line-clamp-2 leading-relaxed",
                            !isRead ? "text-foreground font-medium" : "text-muted-foreground"
                        )}>
                            {message}
                        </p>
                    </div>

                    {/* Quick Actions (visible on hover) */}
                    <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {!isRead && onMarkRead && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkRead(id);
                                }}
                                title="Mark as read"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(id);
                                }}
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Attachments / Meta */}
                {imageUrl && (
                    <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-md border border-border/50 bg-background px-2 py-1 text-xs text-muted-foreground">
                            <ImageIcon className="h-3 w-3" />
                            <span>Attachment</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
