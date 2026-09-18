"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { cn } from "@/lib/utils";
import { useThemeSweep } from "@/components/landing/useThemeSweep";

const MAX_PULL = 52;
const PULL_THRESHOLD = 20;

export function LampPull() {
  const { mounted, isDark, toggleTheme, curtainRef } = useThemeSweep();
  const [pull, setPull] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [swinging, setSwinging] = useState(false);
  const startY = useRef(0);
  const yankTimer = useRef<number | null>(null);
  const swingTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (yankTimer.current) window.clearTimeout(yankTimer.current);
      if (swingTimer.current) window.clearTimeout(swingTimer.current);
    };
  }, []);

  const swing = () => {
    setSwinging(true);
    if (swingTimer.current) window.clearTimeout(swingTimer.current);
    swingTimer.current = window.setTimeout(() => setSwinging(false), 900);
  };

  /** A tap gets the same satisfaction as a drag: yank down, snap back, toggle. */
  const yank = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPull(0);
      toggleTheme();
      return;
    }
    setPull(MAX_PULL * 0.8);
    if (yankTimer.current) window.clearTimeout(yankTimer.current);
    yankTimer.current = window.setTimeout(() => {
      setPull(0);
      swing();
      toggleTheme();
    }, 160);
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!mounted) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    startY.current = event.clientY;
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    const delta = (event.clientY - startY.current) * 0.85;
    setPull(Math.max(0, Math.min(MAX_PULL, delta)));
  };

  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);

    if (pull >= PULL_THRESHOLD) {
      setPull(0);
      swing();
      toggleTheme();
      return;
    }
    yank();
  };

  const onPointerCancel = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
    setPull(0);
  };

  return (
    <>
      <div
        className={cn("lamp", swinging && "lamp--swinging")}
        data-on={mounted && !isDark ? "true" : "false"}
      >
        <span className="lamp-rod" aria-hidden />
        <div className="lamp-fixture">
          <svg className="lamp-shade-svg" width="160" height="90" viewBox="0 0 160 90" fill="none" aria-hidden="true">
            {/* Inner rim glow */}
            <ellipse cx="80" cy="80" rx="76" ry="10" fill={isDark ? "#2a2a2a" : "#fcd34d"} className="transition-colors duration-500 ease-in-out" />
            
            {/* Main dome outer shell */}
            <path d="M4,80 C4,30 35,10 80,10 C125,10 156,30 156,80 Z" fill="url(#outer-shell)" />
            
            {/* Bottom edge highlight (metallic rim) */}
            <path d="M4,80 C4,86 38,90 80,90 C122,90 156,86 156,80" stroke="url(#rim-gradient)" strokeWidth="1.5" fill="none" />

            {/* Top connector (metal cylinder attaching to rod) */}
            <rect x="70" y="0" width="20" height="12" rx="2" fill="url(#metal-connector)" />
            
            {/* Small subtle reflection on the dome */}
            <path d="M25,60 C25,35 45,15 80,15" stroke="rgba(255,255,255,0.15)" strokeWidth="3" fill="none" strokeLinecap="round" filter="blur(2px)" />

            <defs>
              <linearGradient id="outer-shell" x1="0" y1="0" x2="160" y2="0">
                <stop offset="0%" stopColor={isDark ? "#1a1a1a" : "#333"} className="transition-colors duration-500" />
                <stop offset="50%" stopColor={isDark ? "#333" : "#555"} className="transition-colors duration-500" />
                <stop offset="100%" stopColor={isDark ? "#111" : "#1a1a1a"} className="transition-colors duration-500" />
              </linearGradient>

              <linearGradient id="metal-connector" x1="0" y1="0" x2="20" y2="0">
                <stop offset="0%" stopColor="#444" />
                <stop offset="20%" stopColor="#777" />
                <stop offset="50%" stopColor="#555" />
                <stop offset="80%" stopColor="#333" />
                <stop offset="100%" stopColor="#222" />
              </linearGradient>

              <linearGradient id="rim-gradient" x1="0" y1="0" x2="160" y2="0">
                <stop offset="0%" stopColor="#222" />
                <stop offset="50%" stopColor="#666" />
                <stop offset="100%" stopColor="#111" />
              </linearGradient>
            </defs>
          </svg>
          <span className="lamp-bulb" aria-hidden />
          <span className="lamp-beam" aria-hidden />

          <button
            type="button"
            className={cn("lamp-cord", dragging && "lamp-cord--dragging")}
            style={{ "--pull": `${pull}px` } as CSSProperties}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            disabled={!mounted}
            aria-pressed={isDark}
            aria-label={
              isDark ? "Pull the cord to turn the light on" : "Pull the cord to turn the light off"
            }
          >
            <span className="lamp-cord-line" aria-hidden />
            <span className="lamp-cord-bead" aria-hidden />
          </button>
        </div>
      </div>
      <div ref={curtainRef} className="theme-curtain" aria-hidden />
    </>
  );
}
