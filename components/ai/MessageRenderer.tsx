
"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useMessageParser } from "./useMessageParser";
import { LeaveBalanceCard } from "./cards/LeaveBalanceCard";
import { AttendanceCard } from "./cards/AttendanceCard";
import { InsightCard } from "./cards/InsightCard";
import { LeaveTypeCard } from "./cards/LeaveTypeCard";
import { PendingLeaveCard } from "./cards/PendingLeaveCard";

interface MessageRendererProps {
    content: string;
    role: string;
    cancelledIds: Set<string>;
    handleSend: (e?: React.FormEvent, customQuery?: string) => void;
    isLast?: boolean;
    isStreaming?: boolean;
}

export const MessageRenderer = ({ content, role, cancelledIds, handleSend, isLast, isStreaming }: MessageRendererProps) => {
    const parts = useMessageParser(content);

    return (
        <div className="space-y-3 w-full">
            {parts.map((part, idx) => {
                if (part.type === 'text') {
                    const text = part.value.trim();
                    const isFinalPart = idx === parts.length - 1;
                    
                    // Show a base message if it's the very first token
                    if (!text && !(isLast && isStreaming && isFinalPart)) {
                        // If it's the only part and it's empty, and we are streaming, show the dots
                        if (isLast && isStreaming && role === 'assistant' && parts.length === 1) {
                            return (
                                <div key={idx} className="bg-muted/50 border border-border rounded-3xl rounded-tl-none p-4 flex items-center gap-1.5 w-max">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                                </div>
                            );
                        }
                        return null;
                    }
                    
                    return (
                        <div key={idx} className={cn(
                            "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed relative",
                            role === 'user'
                                ? "bg-primary text-primary-foreground rounded-tr-none ml-auto shadow-md shadow-primary/10"
                                : "bg-muted/50 border border-border rounded-tl-none font-medium text-foreground/90"
                        )}>
                            {text}
                            {isLast && isStreaming && isFinalPart && (
                                <span className="inline-block w-2 h-4 bg-primary/40 ml-1 animate-pulse align-middle rounded-sm" />
                            )}
                        </div>
                    );
                } else if (part.type === 'balance') {
                    return <LeaveBalanceCard key={idx} {...part.value} />;
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
