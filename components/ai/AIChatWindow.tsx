"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, User, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import client from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function AIChatWindow({ onClose }: { onClose: () => void }) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hello! I'm your Smart Workplace Assistant. How can I help you with company policies today?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await client.post(API_ENDPOINTS.ASK_POLICY, {
                query: input,
            });

            const assistantMessage: Message = {
                role: "assistant",
                content: response.data.answer,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, I encountered an error. Please try again later.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 w-[400px] h-[600px] flex flex-col glass rounded-3xl overflow-hidden shadow-4xl animate-slide-up z-50">
            {/* Header */}
            <div className="p-5 flex items-center justify-between bg-primary text-primary-foreground">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <Bot size={22} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-tight">HR Policy Brain</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[10px] opacity-80 font-bold uppercase tracking-wider">Online</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-hide"
            >
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={cn(
                            "max-w-[85%] flex flex-col gap-1",
                            msg.role === "user" ? "self-end items-end" : "self-start items-start"
                        )}
                    >
                        <div
                            className={cn(
                                "px-4 py-3 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm",
                                msg.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-white dark:bg-card border border-border/50 rounded-tl-none text-foreground"
                            )}
                        >
                            {msg.content}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-1">
                            {msg.role === "user" ? "You" : "Assistant"}
                        </span>
                    </div>
                ))}
                {isLoading && (
                    <div className="self-start flex flex-col gap-1 items-start max-w-[85%] animate-fade-in">
                        <div className="bg-white dark:bg-card border border-border/50 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-primary" />
                            <span className="text-[13px] font-medium text-muted-foreground">Thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white/50 dark:bg-card/50 backdrop-blur-md border-t border-border/50">
                <div className="relative group">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ask a policy question..."
                        className="w-full bg-white dark:bg-background border border-border/50 rounded-2xl pl-5 pr-14 py-4 text-[13px] font-medium transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 group-hover:border-primary/30"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-3 font-medium flex items-center justify-center gap-1.5">
                    <Sparkles size={10} className="text-primary" />
                    Powered by Smart Workplace AI
                </p>
            </div>
        </div>
    );
}
