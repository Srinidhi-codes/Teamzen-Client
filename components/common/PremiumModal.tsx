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
            <DialogContent className="p-0 border-none bg-transparent shadow-none w-full min-w-fit max-w-[90vw] lg:max-w-3xl">
                <div className={cn(
                    "bg-card rounded-4xl sm:rounded-[3rem] w-full shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] border border-border text-start overflow-hidden flex flex-col animate-in zoom-in-95 duration-500",
                    containerClassName
                )}>
                    {/* Premium Header */}
                    <div className={cn(
                        "relative p-6 sm:p-10 pb-6 sm:pb-8 bg-linear-to-br from-primary/20 via-primary/5 to-background text-primary",
                        headerClassName
                    )}>
                        <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-10 pointer-events-none">
                            <Icon className="w-24 h-24 sm:w-32 sm:h-32 rotate-12" />
                        </div>
                        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-4">
                            <DialogHeader className="space-y-1 flex-1 min-w-0">
                                <DialogTitle className="text-2xl sm:text-4xl font-black text-primary tracking-tighter leading-tight mb-2 sm:mb-3 truncate">
                                    {title || "Modal"}
                                </DialogTitle>
                                {subtitle && (
                                    <DialogDescription className="text-foreground/60 text-[10px] text-start font-black uppercase tracking-widest leading-relaxed">
                                        {subtitle}
                                    </DialogDescription>
                                )}
                            </DialogHeader>

                            <div className="flex items-center gap-3 self-end sm:self-start">
                                {badge && (
                                    <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-primary/10 whitespace-nowrap">
                                        {badge}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 sm:p-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
                        {children}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
