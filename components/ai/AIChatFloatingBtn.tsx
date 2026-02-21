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
            className={`fixed bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-4xl z-50 group hover:-translate-y-1 ${isOpen
                    ? "bg-muted text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
        >
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-slow blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

            {isOpen ? (
                <Bot size={28} className="animate-in fade-in zoom-in duration-300" />
            ) : (
                <MessageSquare size={28} className="animate-in fade-in zoom-in duration-300" />
            )}

            {/* Unread badge/Sparkle */}
            {!isOpen && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-card text-primary rounded-full flex items-center justify-center shadow-lg border border-primary/10">
                    <Sparkles size={14} className="animate-pulse" />
                </div>
            )}
        </button>
    );
}
