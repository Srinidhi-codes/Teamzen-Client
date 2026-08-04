"use client";

import { ArrowRight, MapPin } from "lucide-react";
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
    <div className="w-full rounded-xl border border-border bg-card p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
          <MapPin className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium text-primary/60 mb-0.5">Continue in app</p>
          {reason ? (
            <p className="text-sm text-foreground/80 leading-relaxed mb-3">{reason}</p>
          ) : (
            <p className="text-sm text-muted-foreground mb-3">Open the right screen to finish this.</p>
          )}
          <button
            type="button"
            onClick={() => {
              setAssistantOpen(false);
              router.push(href);
            }}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {title}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
