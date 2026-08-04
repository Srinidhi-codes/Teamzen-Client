"use client";

import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const STORAGE_PREFIX = "teamzen_seen_preboarding_tour_";

export function startPreboardingTour() {
  const steps = [
    {
      element: "#preboarding-details",
      popover: {
        title: "Your details",
        description: "Fill phone, PAN, Aadhaar, and bank details before day one.",
        side: "bottom" as const,
      },
    },
    {
      element: "#preboarding-offer",
      popover: {
        title: "Offer letter",
        description: "Read your offer and accept it by typing your full name.",
        side: "bottom" as const,
      },
    },
    {
      element: "#preboarding-docs",
      popover: {
        title: "Upload documents",
        description: "Upload KYC files. HR verifies them before activating your account.",
        side: "top" as const,
      },
    },
    {
      element: "#preboarding-checklist",
      popover: {
        title: "Checklist",
        description: "Track what’s left. You’ll get portal access after HR activates you.",
        side: "top" as const,
      },
    },
  ].filter(
    (s) => typeof document !== "undefined" && document.querySelector(s.element)
  );

  if (!steps.length) return;
  driver({
    showProgress: true,
    animate: true,
    popoverClass: "driverjs-theme",
    steps,
  }).drive();
}

/** Auto-run once per invite token. */
export function usePreboardingTour(token: string) {
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    const key = STORAGE_PREFIX + token.slice(0, 16);
    try {
      if (localStorage.getItem(key) === "1") return;
    } catch {
      return;
    }
    const t = setTimeout(() => {
      started.current = true;
      startPreboardingTour();
      try {
        localStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }
    }, 900);
    return () => clearTimeout(t);
  }, [token]);
}
