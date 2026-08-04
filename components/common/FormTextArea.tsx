"use client";

import { TextareaHTMLAttributes, useRef, useState } from "react";
import { Loader2, Sparkles, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import axios from "axios";

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  /** Show AI rewrite actions (default true). */
  enableAi?: boolean;
}

const AI_MODES = [
  { id: "improve", label: "Improve" },
  { id: "format", label: "Format" },
  { id: "shorten", label: "Shorten" },
  { id: "professional", label: "Professional" },
  { id: "friendly", label: "Friendly" },
] as const;

export function FormTextarea({
  label,
  error,
  hint,
  enableAi = true,
  value,
  onChange,
  ...props
}: FormTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const runAi = async (mode: string) => {
    setMenuOpen(false);
    const current =
      typeof value === "string"
        ? value
        : ref.current?.value || "";
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
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-muted-foreground">
          {label}
          {props.required && <span className="ml-1 text-destructive">*</span>}
        </label>
        {enableAi && (
          <div className="relative">
            <button
              type="button"
              disabled={busy || props.disabled}
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-muted/40 px-2 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3 text-primary" />
              )}
              AI write
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
      </div>

      <textarea
        ref={ref}
        {...props}
        value={value}
        onChange={onChange}
        className={`w-full resize-none rounded-2xl border bg-background px-5 py-4 text-sm font-medium text-foreground placeholder:text-muted-foreground transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/10 ${
          error
            ? "border-destructive/50 ring-destructive/10"
            : "border-border focus:border-primary/50"
        }`}
      />
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      {hint && <p className="mt-2 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
