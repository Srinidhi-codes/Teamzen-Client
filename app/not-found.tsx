"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, color-mix(in oklch, var(--primary) 14%, transparent), transparent 55%)",
        }}
        aria-hidden
      />

      <div className="relative w-full max-w-lg text-center">
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-card ring-1 ring-border">
          <Image
            src="/images/teamzen_zoomed.png"
            alt="Teamzen"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Teamzen
        </p>
        <p className="mt-4 font-mono text-7xl font-semibold tracking-tight text-foreground/15 sm:text-8xl">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          This page doesn’t exist, or you don’t have access to it.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = "/dashboard";
              }
            }}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
