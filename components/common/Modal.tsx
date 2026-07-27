"use client";

import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />


      {/* Modal */}
      <div className="relative bg-card rounded-xl shadow-lg max-w-md w-full mx-4 overflow-hidden border border-border animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border/50">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Authentication required</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-muted rounded-2xl text-muted-foreground hover:text-foreground transition-all active:scale-90"
          >
            ✕
          </button>
        </div>


        {/* Body */}
        <div className="p-8 text-foreground/80 font-medium leading-relaxed">{children}</div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border/50 bg-muted/20">
          <button
            onClick={onClose}
            className="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Loading…</span>
                </div>
              ) : confirmText}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
