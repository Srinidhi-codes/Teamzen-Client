"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function PublicNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl pointer-events-none">
      <div className="glass px-6 py-4 rounded-3xl flex justify-between items-center shadow-2xl shadow-primary/5 border-border/40 pointer-events-auto">
        <Link href="/" className="flex items-center space-x-3 group text-foreground">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/5 group-hover:rotate-12 transition-transform overflow-hidden p-1.5 border border-primary/20">
            <Image
              src="/images/teamzen_zoomed.png"
              alt="Teamzen"
              width={32}
              height={32}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
          <span className="font-black text-lg tracking-tighter hidden sm:block uppercase">Teamzen</span>
        </Link>

        <div className="flex items-center space-x-2">
          {pathname !== "/login" && (
            <Link href="/login" className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              Login
            </Link>
          )}
          {pathname !== "/register" && (
            <Link href="/register">
              <Button className="btn-primary px-8 rounded-2xl h-11">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
