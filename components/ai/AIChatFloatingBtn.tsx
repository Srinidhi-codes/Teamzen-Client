"use client";

import React from "react";
import { X, MessageCircle } from "lucide-react";

interface AIChatFloatingBtnProps {
    onClick: () => void;
    isOpen: boolean;
}

export default function AIChatFloatingBtn({ onClick, isOpen }: AIChatFloatingBtnProps) {
    return (
        <button
            onClick={onClick}
            className={`fixed bottom-6 right-6 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 z-50 group active:scale-95 border ${isOpen
                ? "bg-card border-border text-foreground"
                : "bg-primary border-primary text-primary-foreground"
                }`}
        >
            <div className="relative z-10">
                {isOpen ? (
                    <X size={24} />
                ) : (
                    <MessageCircle size={24} />
                )}
            </div>

            {/* Status Dot */}
            {!isOpen && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-background">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
            )}
        </button>
    );
}
