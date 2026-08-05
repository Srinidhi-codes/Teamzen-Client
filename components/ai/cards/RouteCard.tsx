"use client";

import { ArrowRight, Compass } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store/useStore";

interface RouteCardProps {
  path: string;
  label?: string;
  reason?: string;
}

export const RouteCard = ({ path, label, reason }: RouteCardProps) => {
  const router = useRouter();
  const setAssistantOpen = useStore((s) => s.setAssistantOpen);
  const href = (path || "").trim();
  if (!href.startsWith("/")) return null;

  const title = (label || "").trim() || "Open page";

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start gap-3 p-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Compass className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Continue in app
          </p>
          <p className="mt-1 text-sm leading-snug text-foreground/90">
            {reason || "Open the right screen to finish this."}
          </p>
          <button
            type="button"
            onClick={() => {
              setAssistantOpen(false);
              router.push(href);
            }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {title}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
