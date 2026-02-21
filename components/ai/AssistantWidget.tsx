
"use client";

import { useState, useRef, useEffect } from "react";
import {
    Send, X, Bot, User, MessageSquare, Trash2,
    Sparkles, Loader2, Minimize2
} from 'lucide-react';
import { useAssistant } from "@/lib/api/assistant";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import moment from "moment";
import { MessageRenderer } from "./MessageRenderer";

export function AssistantWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set());
    const { messages, sendMessage, isLoading, clearHistory } = useAssistant();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (e?: React.FormEvent, customQuery?: string) => {
        e?.preventDefault();
        const query = customQuery || input;

        if (!query.trim() || isLoading) return;

        // Detect if we are cancelling a leave and track the ID for UI reactivity
        const cancelMatch = query.match(/Cancel (?:my )?leave (?:with )?ID\s*(\d+|\w+)/i);
        if (cancelMatch) {
            const id = cancelMatch[1];
            setCancelledIds(prev => new Set(prev).add(id));
        }

        if (!customQuery) {
            setInput("");
        }

        try {
            // Get Geolocation if available
            let latitude: number | undefined;
            let longitude: number | undefined;

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
                }
            }

            await sendMessage({ query, latitude, longitude });
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-100 flex flex-col items-end transition-all duration-300">
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
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Online</span>
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
                                    <p className="text-sm font-black tracking-tight mb-1">How can I help you?</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Ask me anything about your leaves, attendance, or company policies.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-2 w-full pt-4">
                                    {[
                                        "What's my leave balance?",
                                        "Did I check in today?",
                                        "Check me in for today."
                                    ].map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => handleSend(undefined, q)}
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
                                <div className="flex-1 w-full overflow-hidden">
                                    <MessageRenderer
                                        content={msg.content}
                                        role={msg.role}
                                        cancelledIds={cancelledIds}
                                        handleSend={handleSend}
                                    />
                                    <div className={cn(
                                        "w-full text-xs text-muted-foreground/60 mt-1",
                                        msg.role === 'user' ? "text-right pr-2" : "text-left pl-2"
                                    )}>
                                        {msg.timestamp ? moment(msg.timestamp).format("hh:mm A") : moment().format("hh:mm A")}
                                    </div>
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
                                placeholder="Message assistant..."
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
                            Empowered by Teamzen
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
