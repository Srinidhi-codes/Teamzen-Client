"use client";

import { useState, useRef, useEffect } from "react";
import {
    Send, X, Bot, User, Trash2,
    Loader2, Minimize2, Mic, MicOff, Cpu,
    MessageCircle
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
    const { assistantOpen: isOpen, setAssistantOpen: setIsOpen, user, assistantPayload, setAssistantPayload } = useStore();
    const [input, setInput] = useState("");
    const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set());
    const [hasInitialGreeting, setHasInitialGreeting] = useState(false);
    const { 
        messages, 
        setMessages,
        sendMessage, 
        isLoading, 
        isStreaming,
        activeTool,
        clearHistory,
        config
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

            await sendMessage({ query, latitude, longitude, payload: assistantPayload });
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
                <div className="mb-4 w-[calc(100vw-2rem)] sm:w-[500px] h-[calc(100dvh-8rem)] sm:h-[650px] max-h-[85vh] sm:max-h-[700px] bg-card border border-border rounded-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
                                <Bot className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm leading-none mb-1">Assistant</h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-medium text-muted-foreground">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={clearHistory}
                                className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                                title="Clear Chat"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-all"
                            >
                                <Minimize2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="grow overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                    >
                        {messages.length === 0 && (
                            <div className="space-y-5 animate-in fade-in duration-500">
                                <div className="flex gap-3 flex-row">
                                    <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-muted/50 border border-border rounded-xl rounded-tl-md p-4 text-sm leading-relaxed font-medium">
                                            Welcome {user?.firstName}! I can help you understand your leaves, attendance, and company policies. What would you like to know?
                                        </div>
                                        <div className="text-[10px] text-muted-foreground/60 mt-2 pl-2 font-medium">
                                            {moment().format("hh:mm A")}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-2 w-full pt-2">
                                    {[
                                        "What's my leave balance?",
                                        "How many days of casual leave do I have?",
                                        "What is the company policy for sick leaves?",
                                    ].map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => handleSend(undefined, q)}
                                            className="text-xs font-medium p-3 rounded-md border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-left flex items-center gap-3 group/btn"
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
                                    "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
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
                                        activeTool={i === messages.length - 1 ? activeTool : null}
                                        toolsUsed={msg.toolsUsed}
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
                                <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-muted/50 border border-border rounded-xl rounded-tl-md p-4 flex items-center gap-2">
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
                    <div className="p-4 sm:p-5 border-t border-border bg-card">
                        <form
                            onSubmit={handleSend}
                            className="relative group"
                        >
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isRecording ? "Listening..." : "Message assistant..."}
                                className={cn(
                                    "h-12 rounded-md bg-muted/30 border-border focus-visible:ring-primary/20 transition-all font-medium py-3 pl-4 pr-28",
                                    isRecording && "border-primary/50 bg-primary/5"
                                )}
                                disabled={isLoading || isVoiceProcessing}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-20">
                                <button
                                    type="button"
                                    onClick={handleVoiceToggle}
                                    disabled={isLoading || isVoiceProcessing}
                                    className={cn(
                                        "w-9 h-9 rounded-md flex items-center justify-center transition-all active:scale-95",
                                        isRecording 
                                            ? "bg-destructive text-destructive-foreground" 
                                            : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                    )}
                                >
                                    {isVoiceProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim() || isRecording || isVoiceProcessing}
                                    className="w-9 h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
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
                        <div className="mt-3 flex items-center justify-between px-1">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                <Cpu className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                                <span className="text-[9px] font-medium text-muted-foreground/50 truncate">
                                    {config?.model_name || "GPT-4o Mini"}
                                </span>
                            </div>
                            <p className="text-[9px] font-medium text-muted-foreground/30 shrink-0">
                                Teamzen
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Trigger */}
            <button
                id="ai-assistant-trigger"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-95 group relative overflow-hidden border",
                    isOpen
                        ? "bg-card border-border text-foreground hover:bg-muted"
                        : "bg-primary border-primary text-primary-foreground"
                )}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <div className="relative">
                        <MessageCircle className="w-6 h-6" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-primary" />
                    </div>
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
