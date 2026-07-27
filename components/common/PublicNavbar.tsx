"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function PublicNavbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-foreground">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-card ring-1 ring-border">
            <Image
              src="/images/teamzen_zoomed.png"
              alt="Teamzen"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
              priority
            />
          </div>
          <span className="text-base font-semibold tracking-tight">Teamzen</span>
        </Link>

        <div className="flex items-center gap-2">
          {pathname !== "/login" && (
            <Link
              href="/login"
              className="inline-flex h-9 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Login
            </Link>
          )}
          {pathname !== "/register" && (
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
