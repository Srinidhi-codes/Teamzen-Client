"use client";

import { createContext, useContext, ReactNode } from "react";
import { toast as sonnerToast } from "sonner";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const value: ToastContextType = {
        toast: (message: string, type: ToastType = "info") => {
            if (type === "success") sonnerToast.success(message);
            else if (type === "error") sonnerToast.error(message);
            else if (type === "warning") sonnerToast.warning(message);
            else sonnerToast.info(message);
        },
        success: (msg: string) => sonnerToast.success(msg),
        error: (msg: string) => sonnerToast.error(msg),
        warning: (msg: string) => sonnerToast.warning(msg),
        info: (msg: string) => sonnerToast.info(msg),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
