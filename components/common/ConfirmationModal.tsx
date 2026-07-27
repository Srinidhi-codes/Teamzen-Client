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
            label: "Confirm"
        },
        destructive: {
            icon: XCircle,
            iconClass: "bg-destructive/10 text-destructive",
            btnClass: "btn-destructive",
            shadeClass: "from-destructive/20",
            label: "Delete"
        },
        warning: {
            icon: AlertTriangle,
            iconClass: "bg-amber-500/10 text-amber-500",
            btnClass: "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20",
            shadeClass: "from-amber-500/20",
            label: "Warning"
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
            <DialogContent className="sm:max-w-md rounded-xl p-0 overflow-hidden border border-border shadow-lg bg-background">
                <div className={`border-b border-border p-6 relative`}>
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className={`w-10 h-10 rounded-lg ${config.iconClass} flex items-center justify-center`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">{config.label}</div>
                    </div>

                    <DialogHeader className="relative z-10 text-left">
                        <DialogTitle className="text-lg font-semibold mb-2">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed max-w-[90%]">
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-4 bg-muted/5 flex items-center justify-end gap-3">
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
