"use client";

import React from "react";
import { X, LucideIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogHeader,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    badge?: string;
    icon: LucideIcon;
    children: React.ReactNode;
    containerClassName?: string;
    headerClassName?: string;
}

export function PremiumModal({
    isOpen,
    onClose,
    title,
    subtitle,
    badge,
    icon: Icon,
    children,
    containerClassName,
    headerClassName,
}: PremiumModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="p-0 border-none bg-transparent shadow-none w-full min-w-fit max-w-[90vw] md:max-w-3xl">
                <div className={cn(
                    "bg-card rounded-[3rem] w-full shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-500",
                    containerClassName
                )}>
                    {/* Premium Header */}
                    <div className={cn(
                        "relative p-10 pb-8 bg-linear-to-br from-primary/20 via-primary/5 to-background text-primary",
                        headerClassName
                    )}>
                        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                            <Icon className="w-32 h-32 rotate-12" />
                        </div>
                        <div className="relative z-10 flex justify-between items-start">
                            <DialogHeader className="space-y-1">
                                <div>
                                    <DialogTitle className="text-4xl font-black text-primary tracking-tighter leading-none mb-3">
                                        {title || "Modal"}
                                    </DialogTitle>
                                    {subtitle && (
                                        <DialogDescription className="text-foreground/60 text-[10px] font-black uppercase tracking-widest">
                                            {subtitle}
                                        </DialogDescription>
                                    )}
                                </div>
                            </DialogHeader>

                            {badge && (
                                <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-primary/10">
                                    {badge}
                                </div>
                            )}

                            <button
                                onClick={onClose}
                                className="p-2 rounded-2xl hover:bg-primary/10 text-primary transition-all active:scale-90"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
                        {children}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
