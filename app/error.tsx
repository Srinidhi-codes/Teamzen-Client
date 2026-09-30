"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { BrandImages } from "@/lib/brand-images";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors for diagnostics
    console.error("[Teamzen App Error]:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center bg-background px-4 py-12">
      {/* Background ambient glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-destructive/10 blur-[120px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-md text-center">
        {/* Brand Icon */}
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

        {/* Error Badge */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <AlertCircle className="h-7 w-7" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-destructive">
          Application Error
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Something went wrong
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
          An unexpected error occurred while loading this page. You can try recovering the session
          or reload the view.
        </p>

        {error.digest && (
          <p className="mt-2 font-mono text-[11px] text-muted-foreground/70">
            Error ID: {error.digest}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={() => reset()}
            className="h-10 w-full gap-2 rounded-lg sm:w-auto font-semibold"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.reload()}
            className="h-10 w-full gap-2 rounded-lg sm:w-auto"
          >
            Reload page
          </Button>

          <Link
            href="/dashboard"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-[0.98] sm:w-auto"
          >
            <Home className="h-4 w-4 text-muted-foreground" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
