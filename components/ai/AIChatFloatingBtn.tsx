"use client";

import React from "react";
import { MessageSquare, Bot, Sparkles } from "lucide-react";

interface AIChatFloatingBtnProps {
    onClick: () => void;
    isOpen: boolean;
}

export default function AIChatFloatingBtn({ onClick, isOpen }: AIChatFloatingBtnProps) {
    return (
        <button
            onClick={onClick}
            className={`fixed bottom-6 right-6 w-16 h-16 rounded-4xl flex items-center justify-center transition-all duration-500 shadow-2xl z-50 group hover:-translate-y-2 active:scale-90 ${isOpen
                ? "bg-card border border-border text-foreground"
                : "bg-linear-to-tr from-primary via-primary to-violet-600 text-primary-foreground"
                }`}
        >
            {/* Ambient Aura */}
            {!isOpen && (
                <>
                    <div className="absolute inset-0 rounded-4xl bg-primary/40 animate-ping opacity-20 scale-125" />
                    <div className="absolute inset-0 rounded-4xl bg-linear-to-tr from-primary to-violet-600 blur-xl opacity-40 group-hover:opacity-80 transition-opacity animate-pulse-slow" />
                </>
            )}

            <div className="relative z-10 overflow-hidden">
                {isOpen ? (
                    <Bot size={28} className="animate-in fade-in zoom-in spin-in-90 duration-500" />
                ) : (
                    <div className="relative">
                        <Sparkles size={28} className="animate-in fade-in zoom-in duration-500 group-hover:rotate-12 transition-transform" />
                    </div>
                )}
            </div>

            {/* Notification Badge */}
            {!isOpen && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-[10px] font-black text-white rounded-full flex items-center justify-center shadow-lg border-2 border-background animate-in slide-in-from-bottom-2 duration-700">
                    1
                </div>
            )}
        </button>
    );
}
