
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

const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            const cleanBoldText = part.slice(2, -2);
            return (
                <span key={idx} className="font-extrabold text-foreground">
                    {cleanBoldText}
                </span>
            );
        }
        return part;
    });
};

const renderTextWithFormatting = (text: string, trailingCursor?: React.ReactNode) => {
    let lines = text.split('\n');
    const processedLines: string[] = [];
    for (const line of lines) {
        if (line.includes(' - **') || line.includes(' - *')) {
            const parts = line.split(/(?=\s-\s)/);
            for (const part of parts) {
                processedLines.push(part.replace(/^\s*-\s*/, '').trim());
            }
        } else {
            processedLines.push(line);
        }
    }
    lines = processedLines;

    return (
        <div className="space-y-2 w-full">
            {lines.map((line, lineIdx) => {
                const isLastLine = lineIdx === lines.length - 1;
                let currentLine = line.trim();
                
                if (currentLine === '') {
                    return <div key={lineIdx} className="h-1" />;
                }

                // A list item starts with a dash, asterisk, or bullet followed by space
                const isOriginalListItem = /^[-*•]\s+/.test(line.trim());

                // Safe bullet strip: only strip if followed by whitespace
                currentLine = currentLine.replace(/^[-*•]\s+/, '');

                // Check if it's a heading
                const isHeading = line.trim().startsWith('###') || line.trim().startsWith('##') || line.trim().startsWith('#');
                if (isHeading) {
                    const cleanText = line.trim().replace(/^#+\s*/, '');
                    return (
                        <h4 
                            key={lineIdx} 
                            className="font-black text-sm uppercase tracking-widest text-primary border-b border-border pb-1.5 mb-2 mt-4 inline-block underline underline-offset-4 decoration-primary/40"
                        >
                            {renderInlineFormatting(cleanText)}
                            {isLastLine && trailingCursor}
                        </h4>
                    );
                }

                // Check if it's a subheader (ends with a colon but isn't a list item)
                const isSubHeaderOnly = currentLine.endsWith(':') && !isOriginalListItem;
                if (isSubHeaderOnly) {
                    return (
                        <div 
                            key={lineIdx} 
                            className="font-extrabold text-sm text-foreground mt-3 mb-1 underline underline-offset-4 decoration-primary/30"
                        >
                            {renderInlineFormatting(currentLine)}
                            {isLastLine && trailingCursor}
                        </div>
                    );
                }
                
                // Render list item with bullet dot
                if (isOriginalListItem) {
                    return (
                        <div 
                            key={lineIdx} 
                            className="flex items-start gap-2 text-sm leading-relaxed my-1 pl-2"
                        >
                            <span className="text-primary mt-1.5 shrink-0 block w-1.5 h-1.5 rounded-full bg-primary/60" />
                            <span className="flex-1">
                                {renderInlineFormatting(currentLine)}
                                {isLastLine && trailingCursor}
                            </span>
                        </div>
                    );
                }
                
                return (
                    <p key={lineIdx} className="text-sm leading-relaxed">
                        {renderInlineFormatting(currentLine)}
                        {isLastLine && trailingCursor}
                    </p>
                );
            })}
        </div>
    );
};

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
                    const cursor = isLast && isStreaming && isFinalPart ? (
                        <span className="inline-block w-2 h-4 bg-primary/40 ml-1 animate-pulse align-middle rounded-sm" />
                    ) : undefined;
                    
                    return (
                        <div key={idx} className={cn(
                            "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed relative",
                            role === 'user'
                                ? "bg-primary text-primary-foreground rounded-tr-none ml-auto"
                                : "bg-muted/50 border border-border rounded-tl-none font-medium text-foreground/90 w-full"
                        )}>
                            {renderTextWithFormatting(text, cursor)}
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
