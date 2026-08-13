"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, ArrowLeft } from "lucide-react";
import { EmptyImages, BrandImages } from "@/lib/brand-images";

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden">
      <Image
        src={EmptyImages.notFound}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/40"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-lg px-6 py-16 text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-card/90 ring-1 ring-border backdrop-blur-sm">
          <Image
            src={BrandImages.mark}
            alt="Teamzen"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Teamzen
        </p>
        <p className="mt-2 font-mono text-7xl font-semibold tracking-tight text-foreground/20 sm:text-8xl">
          404
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          This page doesn&apos;t exist, or you don&apos;t have access to it.
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
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card/90 px-4 text-sm font-medium backdrop-blur-sm hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
