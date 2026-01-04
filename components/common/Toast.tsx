"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  autoClose?: number;
}

export function Toast({
  message,
  type,
  onClose,
  autoClose = 5000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, autoClose);
    return () => clearTimeout(timer);
  }, [onClose, autoClose]);

  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`border rounded-lg p-4 mb-4 flex items-center justify-between ${styles[type]} animate-slide-in`}
      role="alert"
    >
      <div className="flex items-center space-x-3">
        <span className="text-lg font-bold">{icons[type]}</span>
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="text-lg font-bold hover:opacity-70">
        ×
      </button>
    </div>
  );
}
