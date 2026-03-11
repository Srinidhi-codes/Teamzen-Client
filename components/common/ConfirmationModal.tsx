"use client"
import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react'

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "primary" | "destructive" | "warning" | "success";
}

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "primary"
}: ConfirmationModalProps) => {

    const variantConfig = {
        primary: {
            icon: Info,
            iconClass: "bg-primary/10 text-primary",
            btnClass: "btn-primary",
            shadeClass: "from-primary/20",
            label: "Verification Protocol"
        },
        destructive: {
            icon: XCircle,
            iconClass: "bg-destructive/10 text-destructive",
            btnClass: "btn-destructive",
            shadeClass: "from-destructive/20",
            label: "Critical Action"
        },
        warning: {
            icon: AlertTriangle,
            iconClass: "bg-amber-500/10 text-amber-500",
            btnClass: "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20",
            shadeClass: "from-amber-500/20",
            label: "Security Warning"
        },
        success: {
            icon: CheckCircle2,
            iconClass: "bg-emerald-500/10 text-emerald-500",
            btnClass: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20",
            shadeClass: "from-emerald-500/20",
            label: "Confirmation"
        }
    }

    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-4xl p-0 overflow-hidden border-none shadow-3xl bg-background">
                <div className={`bg-linear-to-br border-b ${config.shadeClass} via-background to-background p-10 relative`}>
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <Icon className="w-32 h-32 rotate-12" />
                    </div>

                    <div className="flex items-center gap-4 mb-8 relative z-10">
                        <div className={`w-14 h-14 rounded-2xl ${config.iconClass} flex items-center justify-center shadow-inner`}>
                            <Icon className="w-7 h-7" />
                        </div>
                        <div className="text-premium-label">{config.label}</div>
                    </div>

                    <DialogHeader className="relative z-10 text-left">
                        <DialogTitle className="text-premium-h2 mb-3">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed max-w-[90%]">
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 bg-muted/5 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="btn-ghost"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`btn ${variant === 'primary' || variant === 'destructive' ? '' : 'px-10 py-4 shadow-2xl '} ${config.btnClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ConfirmationModal
