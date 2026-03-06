"use client";

import { createElement } from "react";

interface FABProps {
    icon: any;
    color: string;
    label?: string;
    onClick?: () => void;
}

export function FAB({ icon: Icon, color, label, onClick }: FABProps) {
    return (
        <div className="flex items-center justify-end gap-3 group translate-x-4 hover:translate-x-0 transition-transform duration-300">
            {label && (
                <span className="bg-foreground text-background text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg mr-2">
                    {label}
                </span>
            )}
            <button
                onClick={onClick}
                className={`w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 ${color}`}
            >
                <Icon className="w-5 h-5" />
            </button>
        </div>
    );
}
