"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ChatGPT-style progressive reveal.
 * Keeps typing after the network stream ends until the UI has caught up.
 */
export function useChatTypewriter(target: string, enabled: boolean) {
  const [len, setLen] = useState(() => (enabled ? 0 : target.length));
  const targetRef = useRef(target);
  const wasEnabled = useRef(enabled);
  targetRef.current = target;

  useEffect(() => {
    if (!enabled) {
      setLen(target.length);
      wasEnabled.current = false;
      return;
    }
    // New typing session — start from the beginning
    if (!wasEnabled.current) {
      setLen(0);
      wasEnabled.current = true;
      return;
    }
    setLen((prev) => (prev > target.length ? target.length : prev));
  }, [enabled, target]);

  useEffect(() => {
    if (!enabled) return;
    if (len >= target.length) return;

    const behind = target.length - len;
    const delay = behind > 240 ? 10 : behind > 100 ? 14 : behind > 40 ? 18 : 24;

    const id = window.setTimeout(() => {
      setLen((prev) => {
        const t = targetRef.current;
        if (prev >= t.length) return t.length;

        const gap = t.length - prev;
        const slice = t.slice(prev);
        const wordMatch = slice.match(/^(\s*\S+\s*)/);
        let step = 4;
        if (wordMatch && wordMatch[1].length <= 14) {
          step = wordMatch[1].length;
        } else if (gap > 200) {
          step = Math.min(28, gap);
        } else if (gap > 80) {
          step = Math.min(12, gap);
        } else {
          step = Math.min(5, gap);
        }
        return Math.min(t.length, prev + step);
      });
    }, delay);

    return () => window.clearTimeout(id);
  }, [enabled, len, target]);

  const revealed = enabled ? target.slice(0, len) : target;
  const isTyping = enabled && len < target.length;
  const done = !enabled || len >= target.length;

  return { revealed, isTyping, done };
}
