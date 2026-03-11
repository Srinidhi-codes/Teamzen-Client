
"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useMessageParser } from "./useMessageParser";
import { BalanceCard } from "./cards/BalanceCard";
import { AttendanceCard } from "./cards/AttendanceCard";
import { InsightCard } from "./cards/InsightCard";
import { LeaveTypeCard } from "./cards/LeaveTypeCard";
import { PendingLeaveCard } from "./cards/PendingLeaveCard";

interface MessageRendererProps {
    content: string;
    role: string;
    cancelledIds: Set<string>;
    handleSend: (e?: React.FormEvent, customQuery?: string) => void;
}

export const MessageRenderer = ({ content, role, cancelledIds, handleSend }: MessageRendererProps) => {
    const parts = useMessageParser(content);

    return (
        <div className="space-y-3 w-full">
            {parts.map((part, idx) => {
                if (part.type === 'text') {
                    const text = part.value.trim();
                    if (!text) return null;
                    return (
                        <div key={idx} className={cn(
                            "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed",
                            role === 'user'
                                ? "bg-primary text-primary-foreground rounded-tr-none ml-auto shadow-md shadow-primary/10"
                                : "bg-muted/50 border border-border rounded-tl-none"
                        )}>
                            {text}
                        </div>
                    );
                } else if (part.type === 'balance') {
                    return <BalanceCard key={idx} {...part.value} />;
                } else if (part.type === 'attendance') {
                    return <AttendanceCard key={idx} {...part.value} />;
                } else if (part.type === 'error') {
                    const { title, message } = part.value;
                    return (
                        <div key={idx} className="bg-destructive/5 border border-destructive/20 rounded-3xl p-5 shadow-sm space-y-2 animate-in zoom-in-95 duration-500 w-full">
                            <div className="flex items-center gap-2 text-destructive">
                                <X className="w-4 h-4" />
                                <h4 className="font-black text-xs uppercase tracking-widest">{title || "Error Occurred"}</h4>
                            </div>
                            <p className="text-sm text-destructive/80 font-medium">{message}</p>
                        </div>
                    );
                } else if (part.type === 'insight') {
                    return <InsightCard key={idx} {...part.value} />;
                } else if (part.type === 'leavetype') {
                    return (
                        <LeaveTypeCard
                            key={idx}
                            {...part.value}
                            onSelect={(name, id) => handleSend(undefined, `I want to apply for ${name} (ID: ${id})`)}
                        />
                    );
                } else if (part.type === 'pendingleave') {
                    return (
                        <PendingLeaveCard
                            key={idx}
                            {...part.value}
                            isCancelled={cancelledIds.has(part.value.id)}
                            onCancel={(id) => handleSend(undefined, `Cancel my leave with ID ${id}`)}
                        />
                    );
                }
                return null;
            })}
        </div>
    );
};
