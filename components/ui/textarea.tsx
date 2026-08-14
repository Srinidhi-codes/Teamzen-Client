"use client";

import * as React from "react";
import { Loader2, Sparkles, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { cn } from "@/lib/utils";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { useOrgPlan } from "@/lib/hooks/useOrgPlan";

const AI_MODES = [
  { id: "improve", label: "Improve" },
  { id: "format", label: "Format" },
  { id: "shorten", label: "Shorten" },
  { id: "professional", label: "Professional" },
  { id: "friendly", label: "Friendly" },
] as const;

type TextareaProps = React.ComponentProps<"textarea"> & {
  /** Hide AI rewrite control (default shows it). */
  enableAi?: boolean;
};

function Textarea({ className, enableAi = true, value, onChange, ...props }: TextareaProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const [busy, setBusy] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { can } = useOrgPlan();
  const showAi = enableAi && can("ai_assistant");

  const runAi = async (mode: string) => {
    setMenuOpen(false);
    const current =
      typeof value === "string" ? value : ref.current?.value || "";
    if (!current.trim()) {
      toast.message("Write something first, then ask AI to improve it.");
      return;
    }
    setBusy(true);
    try {
      const { data } = await axios.post(
        `/api${API_ENDPOINTS.FORMAT_TEXT}`,
        { text: current, mode },
        { withCredentials: true }
      );
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      const next = data?.text || "";
      if (!next) {
        toast.error("AI returned empty text");
        return;
      }
      if (onChange && ref.current) {
        const native = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          "value"
        )?.set;
        native?.call(ref.current, next);
        ref.current.dispatchEvent(new Event("input", { bubbles: true }));
        onChange({
          target: ref.current,
          currentTarget: ref.current,
        } as React.ChangeEvent<HTMLTextAreaElement>);
      } else if (ref.current) {
        ref.current.value = next;
      }
      toast.success("Text updated with AI");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || "AI formatting failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative w-full">
      {showAi && (
        <div className="absolute right-2 top-2 z-10">
          <button
            type="button"
            disabled={busy || props.disabled}
            onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background/95 px-2 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 text-primary" />
            )}
            AI
            <ChevronDown className="h-3 w-3" />
          </button>
          {menuOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 cursor-default"
                aria-label="Close"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-1 min-w-[140px] overflow-hidden rounded-md border border-border bg-card py-1 shadow-lg">
                {AI_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="block w-full px-3 py-1.5 text-left text-xs hover:bg-muted"
                    onClick={() => runAi(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn("textarea", showAi && "pt-10", className)}
        {...props}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export { Textarea };
