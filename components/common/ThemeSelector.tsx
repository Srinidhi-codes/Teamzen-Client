"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function ThemeSelector() {
    const [mounted, setMounted] = useState(false);
    const { setTheme, resolvedTheme } = useTheme();

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const isDark = resolvedTheme === "dark";

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark");
    };

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "relative w-18 h-10 rounded-full border flex items-center p-1 cursor-pointer outline-none select-none shrink-0 group shadow-inner",
                isDark 
                    ? "bg-indigo-950/30 border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-950/40" 
                    : "bg-amber-500/5 border-amber-500/10 hover:border-amber-500/20 hover:bg-amber-500/10"
            )}
            style={{ transition: 'background-color 500ms ease, border-color 500ms ease, box-shadow 500ms ease' }}
            aria-label="Toggle theme"
        >
            {/* Background Icons */}
            <div className="absolute inset-0 flex justify-between px-2.5 items-center pointer-events-none">
                <Sun className={cn(
                    "w-4 h-4", 
                    isDark 
                        ? "text-muted-foreground/20 scale-90" 
                        : "text-amber-500/40 scale-100"
                )} 
                style={{ transition: 'all 500ms ease' }}
                />
                <Moon className={cn(
                    "w-4 h-4", 
                    isDark 
                        ? "text-indigo-400/40 scale-100" 
                        : "text-muted-foreground/20 scale-90"
                )} 
                style={{ transition: 'all 500ms ease' }}
                />
            </div>

            {/* Sliding Knob */}
            <div
                className={cn(
                    "w-8 h-8 rounded-full bg-background border shadow-md flex items-center justify-center transform relative overflow-hidden",
                    isDark 
                        ? "translate-x-8 border-indigo-500/30 shadow-indigo-500/10" 
                        : "translate-x-0 border-amber-500/20 shadow-amber-500/10"
                )}
                style={{ transition: 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), translate 500ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 500ms ease, border-color 500ms ease, box-shadow 500ms ease' }}
            >
                {/* Sun Icon for Light Mode */}
                <Sun 
                    className={cn(
                        "w-5 h-5 text-amber-500 absolute",
                        isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
                    )} 
                    style={{ transition: 'opacity 500ms ease, transform 500ms ease' }}
                />
                {/* Moon Icon for Dark Mode */}
                <Moon 
                    className={cn(
                        "w-5 h-5 text-indigo-400 absolute",
                        isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
                    )} 
                    style={{ transition: 'opacity 500ms ease, transform 500ms ease' }}
                />
            </div>
        </button>
    );
}

