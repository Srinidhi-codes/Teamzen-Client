"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { WifiOff, RotateCw, Home } from "lucide-react";
import { BrandImages } from "@/lib/brand-images";

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      window.location.reload();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    if (navigator.onLine) {
      window.location.reload();
    } else {
      setTimeout(() => {
        setIsRetrying(false);
      }, 1000);
    }
  };

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center bg-background px-4 py-12">
      {/* Background glow effects */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-md text-center">
        {/* Logo and Status Badge */}
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-card shadow-sm ring-1 ring-border backdrop-blur-md">
          <Image
            src={BrandImages.mark}
            alt="Teamzen"
            width={38}
            height={38}
            className="h-9 w-9 object-contain"
            priority
          />
        </div>

        {/* Pulse Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted/60 text-muted-foreground ring-1 ring-border">
          <WifiOff className="h-8 w-8 animate-pulse text-primary" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Network Connection
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          You are currently offline
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
          {isOnline
            ? "Your internet connection is back! Reconnecting now..."
            : "You have lost your internet connection. Some features may not be available until you reconnect."}
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70 sm:w-auto"
          >
            <RotateCw
              className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
            />
            {isRetrying ? "Checking..." : "Retry Connection"}
          </button>

          <Link
            href="/dashboard"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-[0.98] sm:w-auto"
          >
            <Home className="h-4 w-4 text-muted-foreground" />
            Dashboard
          </Link>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Tip: Teamzen works offline for cached views. Reconnect to sync updates.
        </p>
      </div>
    </div>
  );
}
