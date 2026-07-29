"use client";

import { cn } from "@/lib/utils";
import { X, Cpu, CheckCircle2, Loader2 } from "lucide-react";
import { useMessageParser } from "./useMessageParser";
import { LeaveBalanceCard } from "./cards/LeaveBalanceCard";
import { AttendanceCard } from "./cards/AttendanceCard";
import { InsightCard } from "./cards/InsightCard";
import { LeaveTypeCard } from "./cards/LeaveTypeCard";
import { PendingLeaveCard } from "./cards/PendingLeaveCard";
import { PayrollCard } from "./cards/PayrollCard";
import { CitationChips } from "./CitationChips";
import { CorrectionCard } from "./cards/CorrectionCard";
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

const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            const cleanBoldText = part.slice(2, -2);
            return (
                <span key={idx} className="font-semibold text-foreground">
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

                const isOriginalListItem = /^[-*•]\s+/.test(line.trim());
                currentLine = currentLine.replace(/^[-*•]\s+/, '');

                const isHeading = line.trim().startsWith('###') || line.trim().startsWith('##') || line.trim().startsWith('#');
                if (isHeading) {
                    const cleanText = line.trim().replace(/^#+\s*/, '');
                    return (
                        <h4
                            key={lineIdx}
                            className="font-semibold text-sm text-primary border-b border-border pb-1.5 mb-2 mt-4 inline-block"
                        >
                            {renderInlineFormatting(cleanText)}
                            {isLastLine && trailingCursor}
                        </h4>
                    );
                }

                const isSubHeaderOnly = currentLine.endsWith(':') && !isOriginalListItem;
                if (isSubHeaderOnly) {
                    return (
                        <div
                            key={lineIdx}
                            className="font-semibold text-sm text-foreground mt-3 mb-1"
                        >
                            {renderInlineFormatting(currentLine)}
                            {isLastLine && trailingCursor}
                        </div>
                    );
                }

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

// Formats a raw tool name into a readable label
const formatToolName = (name: string) =>
    name.replace(/^teamzen__/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

// Permanent pills shown on the message after it's generated — like Cursor's "Used X tool"
const ToolUsedPills = ({ tools }: { tools: string[] }) => (
    <div className="flex flex-wrap gap-1.5 mb-3">
        {tools.map((tool, i) => (
            <div
                key={i}
                className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
            >
                <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                <Cpu className="w-2.5 h-2.5 shrink-0 opacity-50" />
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
            "inline-flex items-center gap-1.5 text-[10px] font-medium px-3 py-1.5 rounded-md transition-all duration-300 animate-in fade-in",
            isRunning
                ? "text-primary/80 bg-primary/10 border border-primary/20"
                : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
        )}>
            {isRunning
                ? <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                : <CheckCircle2 className="w-3 h-3 shrink-0" />
            }
            <Cpu className="w-3 h-3 shrink-0 opacity-50" />
            <span>{isRunning ? 'Querying: ' : '✓ '}{cleanName}</span>
        </div>
    );
};

export const MessageRenderer = ({ content, role, cancelledIds, handleSend, isLast, isStreaming, activeTool, toolsUsed, sources }: MessageRendererProps) => {
    const parts = useMessageParser(content);
    const richCardTypes = ['balance', 'attendance', 'insight', 'leavetype', 'pendingleave', 'payroll', 'correction'];

    const renderableParts = parts.filter(part => {
        if (part.type === 'text') {
            return part.value.trim().length > 0;
        }
        return true;
    });

    // Show dots when we're waiting for the first token
    const showDots = isLast && isStreaming && role === 'assistant' && renderableParts.length === 0;

    if (showDots) {
        return (
            <div className="bg-muted/50 border border-border rounded-xl rounded-tl-md p-4 flex flex-col gap-2 w-max max-w-[85%] animate-in fade-in duration-300">
                {/* Show permanent tool pills even in loading state if tools already fired */}
                {toolsUsed && toolsUsed.length > 0 && <ToolUsedPills tools={toolsUsed} />}
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                </div>
                {activeTool && (
                    <div className="border-t border-border/50 pt-1.5 mt-0.5">
                        <ToolBadge activeTool={activeTool} />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3 w-full">
            {/* Permanent tool usage pills — always visible on assistant messages that used tools */}
            {role === 'assistant' && toolsUsed && toolsUsed.length > 0 && (
                <ToolUsedPills tools={toolsUsed} />
            )}
            {renderableParts.map((part, idx) => {
                const isFinalPart = idx === renderableParts.length - 1;

                if (part.type === 'text') {
                    const text = part.value.trim();
                    const cursor = isLast && isStreaming && isFinalPart ? (
                        <span className="inline-block w-2 h-4 bg-primary/40 ml-1 animate-pulse align-middle rounded-sm" />
                    ) : undefined;

                    return (
                        <div key={idx} className={cn(
                            "max-w-[85%] p-4 rounded-xl text-sm leading-relaxed relative",
                            role === 'user'
                                ? "bg-primary text-primary-foreground rounded-tr-md ml-auto"
                                : "bg-muted/50 border border-border rounded-tl-md font-medium text-foreground/90 w-full"
                        )}>
                            {renderTextWithFormatting(text, cursor)}
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
                    if (part.type === 'error') {
                        const { title, message } = part.value;
                        return (
                            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 space-y-2 animate-in zoom-in-95 duration-500 w-full">
                                <div className="flex items-center gap-2 text-destructive">
                                    <X className="w-4 h-4" />
                                    <h4 className="font-semibold text-xs">{title || "Error"}</h4>
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

            {/* Live spinning badge during streaming — disappears once done (replaced by permanent pills above) */}
            {isLast && activeTool && role === 'assistant' && renderableParts.length > 0 && (
                <div className="pl-1">
                    <ToolBadge activeTool={activeTool} />
                </div>
            )}

            {role === 'assistant' && sources && sources.length > 0 && (
                <CitationChips sources={sources} />
            )}
        </div>
    );
};
