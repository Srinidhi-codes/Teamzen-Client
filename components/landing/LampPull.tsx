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
          <span className="lamp-shade" aria-hidden />
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
