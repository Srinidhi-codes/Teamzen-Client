"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { useMessageParser } from "./useMessageParser";
import { useChatTypewriter } from "./useChatTypewriter";
import { LeaveBalanceCard } from "./cards/LeaveBalanceCard";
import { AttendanceCard } from "./cards/AttendanceCard";
import { InsightCard } from "./cards/InsightCard";
import { LeaveTypeCard } from "./cards/LeaveTypeCard";
import { PendingLeaveCard } from "./cards/PendingLeaveCard";
import { PayrollCard } from "./cards/PayrollCard";
import { CitationChips } from "./CitationChips";
import { CorrectionCard } from "./cards/CorrectionCard";
import { RouteCard } from "./cards/RouteCard";
import { TypingIndicator } from "./TypingIndicator";
import type { PolicySource } from "@/lib/api/assistant";

interface MessageRendererProps {
    content: string;
    role: string;
    cancelledIds: Set<string>;
    handleSend: (e?: React.FormEvent, customQuery?: string) => void;
    isLast?: boolean;
    isStreaming?: boolean;
    activeTool?: { name: string; status: 'running' | 'completed' } | null;
    toolsUsed?: string[];
    sources?: PolicySource[];
}

const renderInlineFormatting = (text: string, onPrimary = false) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            const cleanBoldText = part.slice(2, -2);
            return (
                <span
                    key={idx}
                    className={cn(
                        "font-semibold",
                        onPrimary ? "text-primary-foreground" : "text-foreground"
                    )}
                >
                    {cleanBoldText}
                </span>
            );
        }
        return part;
    });
};

const renderTextWithFormatting = (
    text: string,
    trailingCursor?: React.ReactNode,
    onPrimary = false
) => {
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
        <div className="space-y-1.5 w-full">
            {lines.map((line, lineIdx) => {
                const isLastLine = lineIdx === lines.length - 1;
                let currentLine = line.trim();

                if (currentLine === '') {
                    return <div key={lineIdx} className="h-1" />;
                }

                const isOriginalListItem = /^[-*•]\s+/.test(line.trim());
                currentLine = currentLine.replace(/^[-*•]\s+/, '');

                const isHeading = line.trim().startsWith('###') || line.trim().startsWith('##') || line.trim().startsWith('#');
                if (isHeading) {
                    const cleanText = line.trim().replace(/^#+\s*/, '');
                    return (
                        <h4
                            key={lineIdx}
                            className={cn(
                                "font-semibold text-sm pb-1 mb-1 mt-2 border-b",
                                onPrimary
                                    ? "text-primary-foreground border-primary-foreground/25"
                                    : "text-foreground border-border"
                            )}
                        >
                            {renderInlineFormatting(cleanText, onPrimary)}
                            {isLastLine && trailingCursor}
                        </h4>
                    );
                }

                const isSubHeaderOnly = currentLine.endsWith(':') && !isOriginalListItem;
                if (isSubHeaderOnly) {
                    return (
                        <div
                            key={lineIdx}
                            className={cn(
                                "font-semibold text-sm mt-2 mb-0.5",
                                onPrimary ? "text-primary-foreground" : "text-foreground"
                            )}
                        >
                            {renderInlineFormatting(currentLine, onPrimary)}
                            {isLastLine && trailingCursor}
                        </div>
                    );
                }

                if (isOriginalListItem) {
                    return (
                        <div
                            key={lineIdx}
                            className="flex items-start gap-2 text-sm leading-relaxed pl-0.5"
                        >
                            <span
                                className={cn(
                                    "mt-2 shrink-0 block w-1 h-1 rounded-full",
                                    onPrimary ? "bg-primary-foreground/70" : "bg-primary/70"
                                )}
                            />
                            <span className="flex-1">
                                {renderInlineFormatting(currentLine, onPrimary)}
                                {isLastLine && trailingCursor}
                            </span>
                        </div>
                    );
                }

                return (
                    <p key={lineIdx} className="text-sm leading-relaxed">
                        {renderInlineFormatting(currentLine, onPrimary)}
                        {isLastLine && trailingCursor}
                    </p>
                );
            })}
        </div>
    );
};

// Formats a raw tool name into a readable label
const formatToolName = (name: string) =>
    name.replace(/^teamzen__/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

// Permanent pills shown on the message after it's generated — like Cursor's "Used X tool"
const ToolUsedPills = ({ tools }: { tools: string[] }) => (
    <div className="flex flex-wrap gap-1.5 mb-2.5">
        {tools.map((tool, i) => (
            <div
                key={i}
                className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/80 border border-border text-muted-foreground"
            >
                <CheckCircle2 className="w-2.5 h-2.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{formatToolName(tool)}</span>
            </div>
        ))}
    </div>
);

// Tool activity badge — shows while a tool is running or just completed
const ToolBadge = ({ activeTool }: { activeTool: { name: string; status: 'running' | 'completed' } }) => {
    const cleanName = formatToolName(activeTool.name);
    const isRunning = activeTool.status === 'running';

    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full transition-all duration-300 animate-in fade-in",
            isRunning
                ? "text-primary bg-primary/10 border border-primary/20"
                : "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
        )}>
            {isRunning
                ? <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                : <CheckCircle2 className="w-3 h-3 shrink-0" />
            }
            <span>{isRunning ? `Using ${cleanName}` : cleanName}</span>
        </div>
    );
};

export const MessageRenderer = ({ content, role, cancelledIds, handleSend, isLast, isStreaming, activeTool, toolsUsed, sources }: MessageRendererProps) => {
    // Keep typing after SSE ends until the UI has caught up (ChatGPT-style)
    const [typeSession, setTypeSession] = useState(false);
    useEffect(() => {
        if (isStreaming && role === "assistant" && isLast) {
            setTypeSession(true);
        }
    }, [isStreaming, role, isLast]);

    const typewriterOn = role === "assistant" && !!isLast && (isStreaming || typeSession);
    const { revealed, isTyping, done } = useChatTypewriter(content, typewriterOn);

    useEffect(() => {
        if (done && !isStreaming && typeSession) {
            setTypeSession(false);
        }
    }, [done, isStreaming, typeSession]);

    // Reset when navigating away from this message being "live"
    useEffect(() => {
        if (!isLast || role !== "assistant") {
            setTypeSession(false);
        }
    }, [isLast, role]);

    const parts = useMessageParser(revealed);

    const renderableParts = parts.filter(part => {
        if (part.type === 'text') {
            return part.value.trim().length > 0;
        }
        return true;
    });

    const waitingForFirstToken =
        typewriterOn &&
        !content.trim() &&
        (isStreaming || !!activeTool);

    if (waitingForFirstToken) {
        return (
            <div className="animate-in fade-in duration-300 space-y-2">
                {toolsUsed && toolsUsed.length > 0 && <ToolUsedPills tools={toolsUsed} />}
                <TypingIndicator activeTool={activeTool} />
            </div>
        );
    }

    const showCursor = typewriterOn && (isStreaming || isTyping);

    return (
        <div className="space-y-2.5 w-full">
            {role === 'assistant' && toolsUsed && toolsUsed.length > 0 && (
                <ToolUsedPills tools={toolsUsed} />
            )}
            {renderableParts.map((part, idx) => {
                const isFinalPart = idx === renderableParts.length - 1;

                if (part.type === 'text') {
                    const text = part.value.trim();
                    const isUser = role === 'user';
                    const cursor = showCursor && isFinalPart ? (
                        <span className="inline-block w-[2px] h-3.5 bg-current/70 ml-0.5 animate-pulse align-middle rounded-sm" />
                    ) : undefined;

                    return (
                        <div key={idx} className={cn(
                            "px-3.5 py-2.5 text-sm leading-relaxed relative shadow-sm",
                            isUser
                                ? "max-w-[min(100%,340px)] ml-auto rounded-2xl rounded-br-md bg-primary text-primary-foreground"
                                : "w-full max-w-full rounded-2xl rounded-bl-md border border-border/70 bg-background/95 text-foreground"
                        )}>
                            {renderTextWithFormatting(text, cursor, isUser)}
                        </div>
                    );
                }

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
                    if (part.type === 'correction') return (
                        <CorrectionCard
                            id={String(part.value.id)}
                            date={part.value.date}
                            login={part.value.login}
                            suggested_logout={part.value.suggested_logout}
                            reason={part.value.reason}
                            isConfirmed={cancelledIds.has(`corr-${part.value.id}`)}
                            onConfirm={(id, suggested) => {
                                const timePart = suggested && suggested !== '—'
                                    ? ` with logout time ${suggested}`
                                    : '';
                                handleSend(
                                    undefined,
                                    `Confirm my attendance correction ID ${id}${timePart}`
                                );
                            }}
                        />
                    );
                    if (part.type === 'payroll') return <PayrollCard {...part.value} />;
                    if (part.type === 'route') {
                        return (
                            <RouteCard
                                path={part.value.path || part.value.href || ""}
                                label={part.value.label}
                                reason={part.value.reason || part.value.message}
                            />
                        );
                    }
                    if (part.type === 'error') {
                        const { title, message } = part.value;
                        return (
                            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 space-y-1.5 animate-in fade-in duration-300 w-full">
                                <div className="flex items-center gap-2 text-destructive">
                                    <X className="w-4 h-4" />
                                    <h4 className="font-semibold text-xs">{title || "Error"}</h4>
                                </div>
                                <p className="text-sm text-destructive/80">{message}</p>
                            </div>
                        );
                    }
                    return null;
                })();

                return (
                    <div key={idx} className="relative w-full animate-in fade-in slide-in-from-bottom-1 duration-300">
                        {cardContent}
                    </div>
                );
            })}

            {showCursor && activeTool && role === 'assistant' && renderableParts.length > 0 && (
                <div className="pl-0.5">
                    <ToolBadge activeTool={activeTool} />
                </div>
            )}

            {role === 'assistant' && sources && sources.length > 0 && !isTyping && (
                <CitationChips sources={sources} />
            )}
        </div>
    );
};
