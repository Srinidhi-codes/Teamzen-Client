"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";

const noopSubscribe = () => () => {};

const CURTAIN_COLOR = {
  light: "oklch(0.97 0.012 200)",
  dark: "oklch(0.15 0.015 240)",
} as const;

const SWEEP_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const SWEEP_DURATION = 720;

type ViewTransition = { ready: Promise<void>; finished: Promise<void> };
type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
};

function applyThemeClass(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

function cornerRadius() {
  return Math.hypot(window.innerWidth, window.innerHeight);
}

/**
 * Theme toggle whose new appearance wipes in diagonally from the top-left.
 * Uses view transitions where available so the incoming theme is revealed
 * through the expanding circle; otherwise a solid curtain covers the swap.
 */
export function useThemeSweep() {
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const { resolvedTheme, setTheme } = useTheme();
  const curtainRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  const isDark = mounted && resolvedTheme === "dark";

  const sweepWithCurtain = useCallback(
    (next: "light" | "dark") => {
      const curtain = curtainRef.current;
      if (!curtain) {
        setTheme(next);
        busyRef.current = false;
        return;
      }

      curtain.style.background = CURTAIN_COLOR[next];
      curtain.style.opacity = "1";
      curtain.style.display = "block";

      const wipe = curtain.animate(
        {
          clipPath: [
            "circle(0px at 0% 0%)",
            `circle(${cornerRadius()}px at 0% 0%)`,
          ],
        },
        { duration: SWEEP_DURATION, easing: SWEEP_EASING, fill: "forwards" }
      );

      wipe.finished
        .then(() => {
          applyThemeClass(next === "dark");
          setTheme(next);
          return curtain.animate(
            { opacity: [1, 0] },
            { duration: 260, easing: "ease-out", fill: "forwards" }
          ).finished;
        })
        .finally(() => {
          curtain.style.display = "none";
          curtain.style.opacity = "0";
          busyRef.current = false;
        });
    },
    [setTheme]
  );

  const toggleTheme = useCallback(() => {
    if (busyRef.current) return;

    const next = isDark ? "light" : "dark";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setTheme(next);
      return;
    }

    busyRef.current = true;
    const doc = document as DocumentWithViewTransition;

    if (typeof doc.startViewTransition !== "function") {
      sweepWithCurtain(next);
      return;
    }

    const transition = doc.startViewTransition(() => {
      flushSync(() => {
        applyThemeClass(next === "dark");
        setTheme(next);
      });
    });

    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              "circle(0px at 0% 0%)",
              `circle(${cornerRadius()}px at 0% 0%)`,
            ],
          },
          {
            duration: SWEEP_DURATION,
            easing: SWEEP_EASING,
            pseudoElement: "::view-transition-new(root)",
          }
        );
      })
      .catch(() => {
        /* transition skipped — theme already applied */
      });

    transition.finished.finally(() => {
      busyRef.current = false;
    });
  }, [isDark, setTheme, sweepWithCurtain]);

  return { mounted, isDark, toggleTheme, curtainRef };
}
