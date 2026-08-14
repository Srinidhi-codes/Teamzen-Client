"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function useDocumentHidden() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false
  );
}

type UseWorkflowDemoOptions = {
  stepCount: number;
  interval?: number;
  autoplay?: boolean;
};

export function useWorkflowDemo({
  stepCount,
  interval = 2600,
  autoplay = true,
}: UseWorkflowDemoOptions) {
  const reduced = usePrefersReducedMotion();
  const hidden = useDocumentHidden();
  const containerRef = useRef<HTMLDivElement>(null);
  const [step, setStepState] = useState(0);
  const [inView, setInView] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && autoplay) setHasPlayed(true);
      },
      { threshold: 0.32, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [autoplay]);

  const playing =
    autoplay &&
    hasPlayed &&
    inView &&
    !manual &&
    !reduced &&
    !hidden &&
    step < stepCount - 1;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => {
      setStepState((current) => Math.min(current + 1, stepCount - 1));
    }, interval);
    return () => window.clearTimeout(id);
  }, [interval, playing, step, stepCount]);

  const setStep = useCallback(
    (index: number) => {
      setManual(true);
      setStepState(Math.max(0, Math.min(stepCount - 1, index)));
    },
    [stepCount]
  );

  const playFrom = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(stepCount - 1, index));
      setManual(false);
      setHasPlayed(true);
      setStepState(next);
    },
    [stepCount]
  );

  const replay = useCallback(() => {
    playFrom(0);
  }, [playFrom]);

  return {
    containerRef,
    step,
    setStep,
    playFrom,
    replay,
    playing,
    reduced,
    inView,
  };
}
