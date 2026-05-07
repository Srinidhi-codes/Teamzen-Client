
"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useMessageParser } from "./useMessageParser";
import { LeaveBalanceCard } from "./cards/LeaveBalanceCard";
import { AttendanceCard } from "./cards/AttendanceCard";
import { InsightCard } from "./cards/InsightCard";
import { LeaveTypeCard } from "./cards/LeaveTypeCard";
import { PendingLeaveCard } from "./cards/PendingLeaveCard";
import { PayrollCard } from "./cards/PayrollCard";

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
    const richCardTypes = ['balance', 'attendance', 'insight', 'leavetype', 'pendingleave', 'payroll'];
    const hasRichCards = role === 'assistant' && parts.some(p => richCardTypes.includes(p.type));

    // Filter parts that should be rendered (only remove truly empty text)
    const renderableParts = parts.filter(part => {
        if (part.type === 'text') {
            return part.value.trim().length > 0;
        }
        return true;
    });
    // Determine if we should show the typing/thinking indicator
    const showDots = isLast && isStreaming && role === 'assistant' && renderableParts.length === 0;

    if (showDots) {
        return (
            <div className="bg-muted/50 border border-border rounded-3xl rounded-tl-none p-4 flex items-center gap-1.5 w-max">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
            </div>
        );
    }

    return (
        <div className="space-y-3 w-full">
            {renderableParts.map((part, idx) => {
                const isFinalPart = idx === renderableParts.length - 1;
                
                if (part.type === 'text') {
                    const text = part.value.trim();
                    return (
                        <div key={idx} className={cn(
                            "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed relative",
                            role === 'user'
                                ? "bg-primary text-primary-foreground rounded-tr-none ml-auto"
                                : "bg-muted/50 border border-border rounded-tl-none font-medium text-foreground/90"
                        )}>
                            {text}
                            {isLast && isStreaming && isFinalPart && (
                                <span className="inline-block w-2 h-4 bg-primary/40 ml-1 animate-pulse align-middle rounded-sm" />
                            )}
                        </div>
                    );
                }

                // For card types, we wrap them to potentially show the streaming cursor
                const cardContent = (() => {
                    if (part.type === 'balance') return <LeaveBalanceCard {...part.value} />;
                    if (part.type === 'attendance') return <AttendanceCard {...part.value} />;
                    if (part.type === 'insight') return <InsightCard {...part.value} />;
                    if (part.type === 'leavetype') return (
                        <LeaveTypeCard
                            {...part.value}
                            onSelect={(name, id) => handleSend(undefined, `I want to apply for ${name} (ID: ${id})`)}
                        />
                    );
                    if (part.type === 'pendingleave') return (
                        <PendingLeaveCard
                            {...part.value}
                            isCancelled={cancelledIds.has(part.value.id)}
                            onCancel={(id) => handleSend(undefined, `Cancel my leave with ID ${id}`)}
                        />
                    );
                    if (part.type === 'payroll') return <PayrollCard {...part.value} />;
                    if (part.type === 'error') {
                        const { title, message } = part.value;
                        return (
                            <div className="bg-destructive/5 border border-destructive/20 rounded-3xl p-5 space-y-2 animate-in zoom-in-95 duration-500 w-full">
                                <div className="flex items-center gap-2 text-destructive">
                                    <X className="w-4 h-4" />
                                    <h4 className="font-black text-xs uppercase tracking-widest">{title || "Error Occurred"}</h4>
                                </div>
                                <p className="text-sm text-destructive/80 font-medium">{message}</p>
                            </div>
                        );
                    }
                    return null;
                })();

                return (
                    <div key={idx} className="relative w-full">
                        {cardContent}
                        {isLast && isStreaming && isFinalPart && (
                            <div className="mt-2 ml-4">
                                <span className="inline-block w-2 h-4 bg-primary/40 animate-pulse align-middle rounded-sm" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
