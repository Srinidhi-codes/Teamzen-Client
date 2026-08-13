"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      disabled={!mounted}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={cn("theme-switch", isDark && "theme-switch--dark")}
    >
      <span className="theme-switch-sky" aria-hidden />
      <span className="theme-switch-night" aria-hidden>
        <span className="theme-switch-star theme-switch-star-1" />
        <span className="theme-switch-star theme-switch-star-2" />
        <span className="theme-switch-star theme-switch-star-3" />
        <span className="theme-switch-star theme-switch-star-4" />
        <span className="theme-switch-star theme-switch-star-5" />
        <span className="theme-switch-star theme-switch-star-6" />
      </span>
      <span className="theme-switch-clouds" aria-hidden>
        <span className="theme-switch-cloud theme-switch-cloud-1" />
        <span className="theme-switch-cloud theme-switch-cloud-2" />
        <span className="theme-switch-cloud theme-switch-cloud-3" />
      </span>
      <span className="theme-switch-knob">
        <span className="theme-switch-sun">
          <span className="theme-switch-rays" />
        </span>
        <span className="theme-switch-moon">
          <span className="theme-switch-crater theme-switch-crater-1" />
          <span className="theme-switch-crater theme-switch-crater-2" />
          <span className="theme-switch-crater theme-switch-crater-3" />
        </span>
      </span>
    </button>
  );
}
