"use client";

import { useState, useRef, useEffect } from "react";
import {
    MessageSquare,
    X,
    Send,
    Sparkles,
    Bot,
    User,
    Loader2,
    Minimize2,
    Trash2,
    Building2,
    Calendar,
    Briefcase
} from "lucide-react";
import { useAssistant } from "@/lib/api/assistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import moment from "moment";

export function AssistantWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const { messages, sendMessage, isLoading, clearHistory } = useAssistant();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const query = input;
        setInput("");

        try {
            // Check if user is trying to mark attendance (heuristic)
            const isAttendanceAction = /check[ -]?in|check[ -]?out|clock[ -]?in|clock[ -]?out|leaving|arrived/i.test(query);

            // Get Geolocation if available
            let latitude: number | undefined;
            let longitude: number | undefined;
            let geoDenied = false;

            if ("geolocation" in navigator) {
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            timeout: 5000,
                            enableHighAccuracy: true
                        });
                    });
                    latitude = position.coords.latitude;
                    longitude = position.coords.longitude;
                } catch (geoError: any) {
                    console.warn("Geolocation failed or denied", geoError);
                    if (geoError.code === geoError.PERMISSION_DENIED) {
                        geoDenied = true;
                    }
                }
            }

            // If it's an attendance action and geo was denied, we should inform the user
            if (isAttendanceAction && geoDenied) {
                // Instead of sending 0, we add a local message explaining the issue
                // But for now, let's just send the query and let the AI handle it, 
                // but accurately reflects that we DON'T have location.
            }

            await sendMessage({ query, latitude, longitude });
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const MessageRenderer = ({ content, role }: { content: string, role: string }) => {
        // Regex to find cards
        const balanceRegex = /\[BALANCE_CARD\]([\s\S]*?)\[\/BALANCE_CARD\]/g;
        const attendanceRegex = /\[ATTENDANCE_CARD\]([\s\S]*?)\[\/ATTENDANCE_CARD\]/g;
        const errorRegex = /\[ERROR_CARD\]([\s\S]*?)\[\/ERROR_CARD\]/g;

        const parts: any[] = [];
        let lastIndex = 0;

        // Combined parsing logic using a single loop for efficiency
        const allMatches: any[] = [];

        let match;
        while ((match = balanceRegex.exec(content)) !== null) {
            allMatches.push({ type: 'balance', index: match.index, lastIndex: balanceRegex.lastIndex, data: match[1] });
        }
        while ((match = attendanceRegex.exec(content)) !== null) {
            allMatches.push({ type: 'attendance', index: match.index, lastIndex: attendanceRegex.lastIndex, data: match[1] });
        }
        while ((match = errorRegex.exec(content)) !== null) {
            allMatches.push({ type: 'error', index: match.index, lastIndex: errorRegex.lastIndex, data: match[1] });
        }

        // Sort matches by index
        allMatches.sort((a, b) => a.index - b.index);

        allMatches.forEach(m => {
            if (m.index > lastIndex) {
                parts.push({ type: 'text', value: content.slice(lastIndex, m.index) });
            }

            const data: any = {};
            m.data.trim().split('|').forEach((part: string) => {
                const [key, val] = part.split(':').map(s => s.trim());
                if (key && val) data[key.toLowerCase()] = val;
            });

            parts.push({ type: m.type, value: data });
            lastIndex = m.lastIndex;
        });

        if (lastIndex < content.length) {
            parts.push({ type: 'text', value: content.slice(lastIndex) });
        }

        return (
            <div className="space-y-3">
                {parts.map((part, idx) => {
                    if (part.type === 'text') {
                        return (
                            <div key={idx} className={cn(
                                "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed",
                                role === 'user'
                                    ? "bg-primary text-primary-foreground rounded-tr-none ml-auto"
                                    : "bg-muted/50 border border-border rounded-tl-none"
                            )}>
                                {part.value.trim()}
                            </div>
                        );
                    } else if (part.type === 'balance') {
                        const { name, total, used, available } = part.value;
                        const usedNum = parseFloat(used) || 0;
                        const totalNum = parseFloat(total) || 1;
                        const percent = Math.min((usedNum / totalNum) * 100, 100);

                        return (
                            <div key={idx} className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4 animate-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Leave Type</p>
                                            <h4 className="font-black text-sm">{name}</h4>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Available</p>
                                        <p className="font-black text-lg text-primary leading-none">{available} <span className="text-[10px]">Days</span></p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                        <span>Used: {used}</span>
                                        <span>Total: {total}</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-1000"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    } else if (part.type === 'attendance') {
                        const { action, status, time, office, distance, hours } = part.value;
                        return (
                            <div key={idx} className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-5 shadow-sm space-y-4 animate-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 mb-0.5">{action}</p>
                                            <h4 className="font-black text-sm text-emerald-900">{office || "Office Location"}</h4>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 mb-0.5">Time</p>
                                        <p className="font-black text-sm text-emerald-600 leading-none">{time}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-emerald-500/10">
                                    {distance && (
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/50">Proximity</p>
                                            <p className="text-xs font-bold text-emerald-700">{distance}</p>
                                        </div>
                                    )}
                                    {hours && (
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/50">Work Duration</p>
                                            <p className="text-xs font-bold text-emerald-700">{hours} hrs</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/50">Status</p>
                                        <p className="text-xs font-bold text-emerald-700 capitalize">{status}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    } else if (part.type === 'error') {
                        const { title, message } = part.value;
                        return (
                            <div key={idx} className="bg-destructive/5 border border-destructive/20 rounded-3xl p-5 shadow-sm space-y-2 animate-in shake-in duration-500">
                                <div className="flex items-center gap-2 text-destructive">
                                    <X className="w-4 h-4" />
                                    <h4 className="font-black text-xs uppercase tracking-widest">{title || "Error Occurred"}</h4>
                                </div>
                                <p className="text-sm text-destructive/80 font-medium">
                                    {message}
                                </p>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        );
    };

    return (
        <div className="fixed bottom-6 right-6 z-100 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[400px] h-[600px] bg-card border border-border rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="p-6 border-b border-border bg-muted/20 backdrop-blur-sm flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 relative overflow-hidden">
                                <Bot className="w-6 h-6 text-primary-foreground relative z-10" />
                                <div className="absolute inset-0 bg-linear-to-tr from-white/20 to-transparent opacity-50" />
                            </div>
                            <div>
                                <h3 className="font-black tracking-tight text-sm leading-none mb-1">Smart Assistant</h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Always Ready</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={clearHistory}
                                className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                                title="Clear Chat"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all"
                            >
                                <Minimize2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="grow overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                    >
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
                                <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-primary opacity-20" />
                                </div>
                                <div>
                                    <p className="text-sm font-black tracking-tight mb-1">Welcome back!</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Ask me about your leave balance, check-in status, or any company policies.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-2 w-full pt-4">
                                    {[
                                        "What's my sick leave balance?",
                                        "Did I check in today?",
                                        "How do I apply for leave?"
                                    ].map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => {
                                                setInput(q);
                                                // Trigger send in next tick
                                                setTimeout(() => handleSend(), 0);
                                            }}
                                            className="text-[10px] font-black uppercase tracking-widest p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                    msg.role === 'user' ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                                )}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className="flex-1">
                                    <MessageRenderer content={msg.content} role={msg.role} />
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 animate-in fade-in duration-300">
                                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-muted/50 border border-border rounded-3xl rounded-tl-none p-4 flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 border-t border-border bg-card">
                        <form
                            onSubmit={handleSend}
                            className="relative group"
                        >
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Write something..."
                                className="pr-14 h-14 rounded-2xl bg-muted/30 border-border focus-visible:ring-primary/20 transition-all font-medium py-4 px-6"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 z-20"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </form>
                        <p className="mt-3 text-[10px] text-center font-black uppercase tracking-widest text-muted-foreground/50">
                            Powered by Smart Worker Engine
                        </p>
                    </div>
                </div>
            )}

            {/* Floating Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-16 h-16 rounded-4xl shadow-2xl flex items-center justify-center transition-all duration-500 active:scale-90 group relative overflow-hidden",
                    isOpen
                        ? "bg-card border border-border text-foreground hover:bg-muted"
                        : "bg-primary text-primary-foreground hover:shadow-primary/30"
                )}
            >
                {isOpen ? (
                    <X className="w-7 h-7" />
                ) : (
                    <div className="relative">
                        <MessageSquare className="w-7 h-7" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-primary animate-pulse" />
                    </div>
                )}
                {/* Glow layer */}
                {!isOpen && (
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
            </button>
        </div>
    );
}
