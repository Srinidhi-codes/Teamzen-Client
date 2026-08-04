"use client";

import { useCallback, useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

const STORAGE_KEY = "teamzen_seen_my_onboarding_tour";

export function startMyOnboardingTour() {
  const steps = [
    {
      element: "#my-onboarding-progress",
      popover: {
        title: "Your progress",
        description: "See how far you are through preboarding and day-1 tasks.",
        side: "bottom" as const,
      },
    },
    {
      element: "#my-onboarding-offer",
      popover: {
        title: "Offer letter",
        description: "Review and accept your offer by typing your full name.",
        side: "bottom" as const,
      },
    },
    {
      element: "#my-onboarding-docs",
      popover: {
        title: "Documents",
        description: "Upload ID, PAN, Aadhaar, and bank proof. HR will verify them.",
        side: "top" as const,
      },
    },
    {
      element: "#my-onboarding-checklist",
      popover: {
        title: "Checklist",
        description: "Complete your assigned tasks. Ask the AI assistant if you’re stuck.",
        side: "top" as const,
      },
    },
    {
      element: "#ai-assistant-trigger",
      popover: {
        title: "Onboarding buddy",
        description:
          "Ask “what’s left on my onboarding?” or policy questions from the handbook.",
        side: "left" as const,
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

export function useMyOnboardingTour(autoStart = true) {
  const started = useRef(false);

  const startTour = useCallback(() => {
    startMyOnboardingTour();
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!autoStart || started.current) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      return;
    }
    const t = setTimeout(() => {
      started.current = true;
      startTour();
    }, 1200);
    return () => clearTimeout(t);
  }, [autoStart, startTour]);

  return { startTour };
}

export function MyOnboardingTourButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      id="my-onboarding-tour-trigger"
      onClick={() => startMyOnboardingTour()}
      className="gap-1.5"
    >
      <HelpCircle className="h-4 w-4" />
      Take tour
    </Button>
  );
}
