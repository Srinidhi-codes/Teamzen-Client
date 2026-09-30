"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X, Share, SquarePlus, MoreVertical, ChevronDown, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { BrandImages } from "@/lib/brand-images";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaRegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [showIOSBanner, setShowIOSBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isSecure, setIsSecure] = useState(true);

  useEffect(() => {
    // 1. Check if already running in standalone mode (already installed)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const standalone = checkStandalone();
    if (standalone) return;

    // Check secure context
    if (typeof window !== "undefined") {
      setIsSecure(window.isSecureContext);
    }

    // 2. Detect platform
    const userAgent = navigator.userAgent || "";
    const isIOS =
      /iPad|iPhone|iPod/.test(userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(userAgent);

    // Show iOS banner if on iOS and not dismissed
    if (isIOS) {
      const dismissedIOS = localStorage.getItem("pwa_ios_dismissed_until");
      if (!dismissedIOS || Date.now() > Number(dismissedIOS)) {
        setShowIOSBanner(true);
      }
    }

    // On Android, show install banner proactively (even if beforeinstallprompt hasn't fired yet)
    if (isAndroid) {
      const dismissedAndroid = localStorage.getItem("pwa_dismissed_until");
      if (!dismissedAndroid || Date.now() > Number(dismissedAndroid)) {
        setShowAndroidBanner(true);
      }
    }

    // 3. Register Service Worker (only in production; unregister in development to prevent HMR/Fast Refresh loops)
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV !== "production") {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
      } else if (window.isSecureContext) {
        const registerSW = () => {
          navigator.serviceWorker
            .register("/sw.js", { scope: "/" })
            .then((registration) => {
              registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (installingWorker) {
                  installingWorker.onstatechange = () => {
                    if (
                      installingWorker.state === "installed" &&
                      navigator.serviceWorker.controller
                    ) {
                      console.log("[PWA] New version ready.");
                    }
                  };
                }
              };
            })
            .catch((err) => {
              console.warn("[PWA] Service worker registration note:", err);
            });
        };

        if (document.readyState === "complete") {
          registerSW();
        } else {
          window.addEventListener("load", registerSW);
        }
      }
    }

    // 4. Capture native Chromium install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);

      const dismissedUntil = localStorage.getItem("pwa_dismissed_until");
      if (!dismissedUntil || Date.now() > Number(dismissedUntil)) {
        setShowAndroidBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setShowAndroidBanner(false);
      setShowIOSBanner(false);
      setShowAndroidGuide(false);
      localStorage.removeItem("pwa_dismissed_until");
      localStorage.removeItem("pwa_ios_dismissed_until");
      toast.success("Teamzen was installed successfully!");
    };

    const handleOnline = () => {
      toast.success("Back online. Connected to server.");
    };

    const handleOffline = () => {
      toast.warning("You are offline. Showing cached workspace.", {
        duration: 4000,
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    // If native prompt is available (HTTPS / supported Chromium), trigger it directly
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setShowAndroidBanner(false);
        }
      } catch (err) {
        console.error("[PWA] Error showing install prompt:", err);
      }
      return;
    }

    // If native prompt is not available (e.g. testing over HTTP LAN IP or unsupported browser), show manual steps
    setShowAndroidGuide(true);
  };

  const handleDismissAndroid = () => {
    setShowAndroidBanner(false);
    setShowAndroidGuide(false);
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("pwa_dismissed_until", String(nextWeek));
  };

  const handleDismissIOS = () => {
    setShowIOSBanner(false);
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("pwa_ios_dismissed_until", String(nextWeek));
  };

  // If already installed in standalone mode, show nothing
  if (isStandalone) {
    return null;
  }

  // 1. iOS Guided Walkthrough Banner
  if (showIOSBanner) {
    return (
      <aside
        aria-label="Install Teamzen on iOS"
        className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl border border-border/80 bg-card/95 p-4 shadow-2xl backdrop-blur-xl transition-all animate-in fade-in slide-in-from-bottom-5 sm:bottom-6 sm:left-auto sm:right-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background p-1.5 shadow-inner ring-1 ring-border">
              <Image
                src={BrandImages.mark}
                alt="Teamzen"
                width={30}
                height={30}
                className="h-6 w-6 object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Install Teamzen</p>
              <p className="text-[11px] text-muted-foreground">Add to your Home Screen</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismissIOS}
            aria-label="Close"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Guided Steps for iOS */}
        <div className="mt-3.5 space-y-2 rounded-xl bg-muted/50 p-2.5 text-xs text-foreground/90">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] font-bold text-primary">
              1
            </span>
            <span className="flex items-center gap-1">
              Tap the <strong className="font-semibold text-foreground">Share</strong> icon
              <Share className="mx-0.5 inline h-3.5 w-3.5 text-primary" /> in Safari
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] font-bold text-primary">
              2
            </span>
            <span className="flex items-center gap-1">
              Scroll down and tap <strong className="font-semibold text-foreground">Add to Home Screen</strong>
              <SquarePlus className="mx-0.5 inline h-3.5 w-3.5 text-primary" />
            </span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
          <span>Safari toolbar below</span>
          <ChevronDown className="h-3 w-3 animate-bounce text-primary" />
        </div>
      </aside>
    );
  }

  // 2. Android / Desktop Banner
  if (showAndroidBanner) {
    return (
      <aside
        aria-label="Install App"
        className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl border border-border/80 bg-card/95 p-3.5 shadow-2xl backdrop-blur-xl transition-all animate-in fade-in slide-in-from-bottom-4 sm:left-auto sm:right-6 sm:max-w-sm"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background p-1.5 shadow-inner ring-1 ring-border">
              <Image
                src={BrandImages.mark}
                alt="Teamzen"
                width={30}
                height={30}
                className="h-6 w-6 object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">Install Teamzen App</p>
              <p className="truncate text-[11px] text-muted-foreground">
                Install to home screen for fast access
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              Install
            </button>
            <button
              type="button"
              onClick={handleDismissAndroid}
              aria-label="Close"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Guided steps for Android if native prompt was unavailable (e.g. HTTP LAN or unprompted Chrome) */}
        {showAndroidGuide && (
          <div className="mt-3 border-t border-border/60 pt-2.5 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-1.5 rounded-xl bg-muted/60 p-2.5 text-xs text-foreground/90">
              <div className="flex items-center gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[9px] font-bold text-primary">
                  1
                </span>
                <span className="flex items-center gap-1">
                  Tap the <strong className="font-semibold text-foreground">menu</strong>
                  <MoreVertical className="mx-0.5 inline h-3.5 w-3.5 text-primary" /> in Chrome
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[9px] font-bold text-primary">
                  2
                </span>
                <span className="flex items-center gap-1">
                  Tap <strong className="font-semibold text-foreground">Install app</strong> or <strong className="font-semibold text-foreground">Add to Home screen</strong>
                  <Smartphone className="mx-0.5 inline h-3.5 w-3.5 text-primary" />
                </span>
              </div>
            </div>

            {!isSecure && (
              <p className="mt-2 text-[10px] text-amber-500/90 leading-tight">
                * Note: Mobile browsers require HTTPS or Chrome USB debugging for full offline service workers.
              </p>
            )}
          </div>
        )}
      </aside>
    );
  }

  return null;
}
