"use client";

import { useState, useRef, useEffect } from "react";
import {
    Send, X, Bot, User, MessageSquare, Trash2,
    Sparkles, Loader2, Minimize2, Mic, MicOff
} from 'lucide-react';
import { useVoiceWhisper } from "@/lib/hooks/useVoiceWhisper";
import { VoiceWave } from "./VoiceWave";
import { useAssistant } from "@/lib/api/assistant";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import moment from "moment";
import { MessageRenderer } from "./MessageRenderer";
import { useStore } from "@/lib/store/useStore";
import ConfirmationModal from "@/components/common/ConfirmationModal";

export function AssistantWidget() {
    const { assistantOpen: isOpen, setAssistantOpen: setIsOpen, user } = useStore();
    const [input, setInput] = useState("");
    const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set());
    const [hasInitialGreeting, setHasInitialGreeting] = useState(false);
    const { 
        messages, 
        setMessages,
        sendMessage, 
        isLoading, 
        isStreaming,
        clearHistory 
    } = useAssistant();
    const { isRecording, isProcessing: isVoiceProcessing, startRecording, stopRecording, error: voiceError } = useVoiceWhisper({
        onTranscript: (text) => {
            if (text) {
                handleSend(undefined, text);
            }
        }
    });
    const [isMicErrorModalOpen, setIsMicErrorModalOpen] = useState(false);
    
    // Watch for mic errors
    useEffect(() => {
        if (voiceError === "device-not-found" || voiceError === "permission-denied") {
            setIsMicErrorModalOpen(true);
        }
    }, [voiceError]);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Deep Link Query Handler
    const { assistantQuery, setAssistantQuery } = useStore();
    useEffect(() => {
        if (assistantQuery && isOpen) {
            // Small delay to ensure any opening animations or state updates settle
            const timer = setTimeout(() => {
                handleSend(undefined, assistantQuery);
                setAssistantQuery(""); // Clear after sending
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [assistantQuery, isOpen]);

    // Body scroll lock on mobile
    useEffect(() => {
        if (isOpen && window.innerWidth < 768) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Snap to bottom
    useEffect(() => {
        if (isOpen && scrollRef.current) {
            // Micro-task to ensure DOM paint
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 0);
        }
    }, [messages, isLoading, isOpen]);

    const handleSend = async (e?: React.FormEvent, customQuery?: string) => {
        e?.preventDefault();
        const query = customQuery || input;

        if (!query.trim() || isLoading) return;

        // --- OPTIMISTIC UPDATE (Instant) ---
        setMessages(prev => [...prev, { 
            role: 'user', 
            content: query, 
            timestamp: new Date().toISOString() 
        }]);

        if (!customQuery) {
            setInput("");
        }

        // Detect if we are cancelling a leave and track the ID for UI reactivity
        const cancelMatch = query.match(/Cancel (?:my )?leave (?:with )?ID\s*(\d+|\w+)/i);
        if (cancelMatch) {
            const id = cancelMatch[1];
            setCancelledIds(prev => new Set(prev).add(id));
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

    const handleVoiceToggle = async () => {
        if (isRecording) {
            await stopRecording();
        } else {
            await startRecording();
        }
    };

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-100 flex flex-col items-end transition-all duration-300">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[calc(100vw-2rem)] sm:w-[500px] h-[calc(100dvh-8rem)] sm:h-[650px] max-h-[85vh] sm:max-h-[700px] bg-card/95 backdrop-blur-xl border border-border/50 rounded-4xl sm:rounded-[2.5rem] shadow-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 sm:p-6 border-b border-border bg-muted/20 backdrop-blur-sm flex justify-between items-center group">
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
                        className="grow overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                    >
                        {messages.length === 0 && (
                            <div className="space-y-6 animate-in fade-in duration-700 delay-300">
                                <div className="flex gap-3 flex-row">
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-muted/50 border border-border rounded-3xl rounded-tl-none p-4 sm:p-6 text-sm leading-relaxed font-medium">
                                            Welcome {user?.firstName}! I can help you understand your leaves, attendance, and company policies. What would you like to know?
                                        </div>
                                        <div className="text-[10px] text-muted-foreground/60 mt-2 pl-2 font-bold uppercase tracking-widest">
                                            {moment().format("hh:mm A")}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-2 w-full pt-4">
                                    {[
                                        "What's my leave balance?",
                                        "How many days of casual leave do I have?",
                                        "What is the company policy for sick leaves?",
                                    ].map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => handleSend(undefined, q)}
                                            className="text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-left flex items-center gap-3 group/btn"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover/btn:bg-primary transition-colors" />
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
                                        isLast={i === messages.length - 1}
                                        isStreaming={isStreaming}
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

                        {isLoading && !isStreaming && (
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
                    <div className="p-4 sm:p-6 border-t border-border bg-card">
                        <form
                            onSubmit={handleSend}
                            className="relative group"
                        >
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isRecording ? "Listening..." : "Message assistant..."}
                                className={cn(
                                    "h-14 rounded-2xl bg-muted/30 border-border focus-visible:ring-primary/20 transition-all font-medium py-4 pl-6 pr-28",
                                    isRecording && "animate-pulse border-primary/50 bg-primary/5"
                                )}
                                disabled={isLoading || isVoiceProcessing}
                            />
                            <div className="absolute right-2 top-2 flex items-center gap-1.5 z-20">
                                <button
                                    type="button"
                                    onClick={handleVoiceToggle}
                                    disabled={isLoading || isVoiceProcessing}
                                    className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg",
                                        isRecording 
                                            ? "bg-destructive text-destructive-foreground shadow-destructive/20" 
                                            : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                    )}
                                >
                                    {isVoiceProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim() || isRecording || isVoiceProcessing}
                                    className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>
                            
                            {/* Listening Overlay/Wave */}
                            {(isRecording || isVoiceProcessing) && (
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <VoiceWave isProcessing={isVoiceProcessing} />
                                </div>
                            )}
                        </form>
                        <p className="mt-3 text-[10px] text-center font-black uppercase tracking-widest text-muted-foreground/50">
                            Empowered by Teamzen
                        </p>
                    </div>
                </div>
            )}

            {/* Floating Trigger */}
            <button
                id="ai-assistant-trigger"
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

            {/* Mic Error Modal */}
            <ConfirmationModal
                isOpen={isMicErrorModalOpen}
                onClose={() => setIsMicErrorModalOpen(false)}
                onConfirm={() => setIsMicErrorModalOpen(false)}
                title={voiceError === "permission-denied" ? "Microphone Access Denied" : "Microphone Not Found"}
                description={
                    voiceError === "permission-denied"
                        ? "Please enable microphone permissions in your browser settings to use voice input."
                        : "No microphone was detected. Please connect a recording device to use the voice assistant."
                }
                confirmText="Got it"
                variant={voiceError === "permission-denied" ? "warning" : "destructive"}
            />
        </div>
    );
}
