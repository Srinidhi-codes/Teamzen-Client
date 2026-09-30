"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CookiePreferences {
  essential: boolean; // Always true
  preferences: boolean; // Theme, color accents, sidebar
  analytics: boolean; // Anonymous usage telemetry
  timestamp: number;
}

const STORAGE_KEY = "teamzen_cookie_consent";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [preferences, setPreferences] = useState({
    preferences: true,
    analytics: false,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Small delay so it animates in smoothly after initial paint
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // In case localStorage is disabled
    }
  }, []);

  const saveConsent = (prefs: { preferences: boolean; analytics: boolean }) => {
    try {
      const payload: CookiePreferences = {
        essential: true,
        preferences: prefs.preferences,
        analytics: prefs.analytics,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage errors
    }
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ preferences: true, analytics: true });
  };

  const handleEssentialOnly = () => {
    saveConsent({ preferences: false, analytics: false });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 z-60 mx-auto max-w-xl rounded-2xl border border-border/80 bg-card/95 p-4 shadow-2xl backdrop-blur-xl transition-all animate-in fade-in slide-in-from-bottom-5 sm:bottom-6 sm:p-5"
    >
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Cookie className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Cookie & Privacy Notice</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3 w-3" /> Secure
            </span>
          </div>

          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Teamzen uses essential HTTP-only cookies to keep your account session secure, and
            optional cookies to remember your theme preferences. Learn more in our{" "}
            <Link
              href="/privacy"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              Privacy Policy
            </Link>
            .
          </p>

          {isCustomizing && (
            <div className="mt-3.5 space-y-2 rounded-xl bg-muted/40 p-3 text-xs border border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Essential Cookies */}
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/40">
                <div>
                  <p className="font-semibold text-foreground">Strictly Essential</p>
                  <p className="text-[11px] text-muted-foreground">
                    Required for authentication, session security, and cookie proxy.
                  </p>
                </div>
                <span className="shrink-0 rounded-md bg-muted px-2 py-1 font-mono text-[10px] font-semibold text-muted-foreground">
                  Always Active
                </span>
              </div>

              {/* Preference Cookies */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div>
                  <p className="font-semibold text-foreground">Preferences & Theme</p>
                  <p className="text-[11px] text-muted-foreground">
                    Remembers dark mode, custom color accents, and sidebar state.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.preferences}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, preferences: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                />
              </div>

              {/* Anonymous Analytics */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div>
                  <p className="font-semibold text-foreground">Performance & Diagnostics</p>
                  <p className="text-[11px] text-muted-foreground">
                    Helps us understand app stability and navigation performance.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40">
            <button
              type="button"
              onClick={() => setIsCustomizing((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              {isCustomizing ? (
                <>
                  Less options <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Customize <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEssentialOnly}
                className="h-8 rounded-lg text-xs font-medium"
              >
                Essential Only
              </Button>

              {isCustomizing ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveCustom}
                  className="h-8 rounded-lg text-xs font-semibold"
                >
                  <Check className="mr-1 h-3.5 w-3.5" />
                  Save Preferences
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAcceptAll}
                  className="h-8 rounded-lg text-xs font-semibold"
                >
                  Accept All
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
