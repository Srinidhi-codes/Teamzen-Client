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
                    "bg-card rounded-xl w-full shadow-lg border border-border text-start overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 max-h-[min(90dvh,800px)]",
                    containerClassName
                )}>
                    <div className={cn(
                        "relative p-6 sm:p-8 pb-4 sm:pb-6 border-b border-border bg-muted/30",
                        headerClassName
                    )}>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <DialogHeader className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className="w-5 h-5 text-primary shrink-0" />
                                    <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground leading-tight truncate">
                                        {title || "Modal"}
                                    </DialogTitle>
                                </div>
                                {subtitle && (
                                    <DialogDescription className="text-sm text-muted-foreground text-start leading-relaxed">
                                        {subtitle}
                                    </DialogDescription>
                                )}
                            </DialogHeader>

                            <div className="flex items-center gap-3 self-end sm:self-start">
                                {badge && (
                                    <div className="px-2 py-0.5 bg-primary/10 rounded-md text-[11px] font-medium capitalize border border-primary/10 whitespace-nowrap">
                                        {badge}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 sm:p-10 overflow-y-auto flex-1 min-h-0 max-h-[60vh] sm:max-h-[70vh] custom-scrollbar">
                        {children}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
