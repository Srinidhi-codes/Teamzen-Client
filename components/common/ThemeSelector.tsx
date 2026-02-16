"use client";

import { useTheme } from "next-themes";
import { useStore } from "@/lib/store/useStore";
import { ColorAccent } from "@/lib/store/slices/themeSlice";
import {
    Check,
    Palette,
    Moon,
    Sun,
    Monitor,
    Layout,
    Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const accents: { name: ColorAccent; color: string; label: string }[] = [
    { name: "indigo", color: "bg-indigo-600", label: "Indigo" },
    { name: "blue", color: "bg-blue-600", label: "Blue" },
    { name: "green", color: "bg-green-600", label: "Green" },
    { name: "red", color: "bg-red-600", label: "Red" },
    { name: "orange", color: "bg-orange-600", label: "Orange" },
    { name: "purple", color: "bg-purple-600", label: "Purple" },
    { name: "slate", color: "bg-slate-600", label: "Slate" },
];

export function ThemeSelector() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const { accent, setAccent } = useStore();
    const [isOpen, setIsOpen] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-accent transition-colors flex items-center gap-2 group"
                title="Theme Settings"
            >
                <Palette className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <div className={cn("w-3 h-3 rounded-full", accents.find(a => a.name === accent)?.color)} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-72 glass-dark shadow-2xl rounded-2xl border border-border p-4 z-50 animate-fade-in origin-top-right">
                        <div className="space-y-6">
                            {/* Appearance Section */}
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Layout className="w-3 h-3" /> Appearance
                                </h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setTheme("light")}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-2 rounded-xl transition-all border-2",
                                            theme === "light" ? "border-primary bg-primary/10" : "border-transparent bg-secondary hover:bg-accent"
                                        )}
                                    >
                                        <Sun className="w-5 h-5" />
                                        <span className="text-[10px] font-medium">Light</span>
                                    </button>
                                    <button
                                        onClick={() => setTheme("dark")}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-2 rounded-xl transition-all border-2",
                                            theme === "dark" ? "border-primary bg-primary/10" : "border-transparent bg-secondary hover:bg-accent"
                                        )}
                                    >
                                        <Moon className="w-5 h-5" />
                                        <span className="text-[10px] font-medium">Dark</span>
                                    </button>
                                    <button
                                        onClick={() => setTheme("system")}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-2 rounded-xl transition-all border-2",
                                            theme === "system" ? "border-primary bg-primary/10" : "border-transparent bg-secondary hover:bg-accent"
                                        )}
                                    >
                                        <Clock className="w-5 h-5" />
                                        <span className="text-[10px] font-medium">Auto</span>
                                    </button>
                                </div>
                            </div>

                            {/* Accent Color Section */}
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                    Accent Color
                                </h4>
                                <div className="grid grid-cols-4 gap-3">
                                    {accents.map((item) => (
                                        <button
                                            key={item.name}
                                            onClick={() => setAccent(item.name)}
                                            className="flex flex-col items-center gap-1.5 group"
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ring-offset-2 ring-offset-background",
                                                item.color,
                                                accent === item.name ? "ring-2 ring-primary scale-110 shadow-lg shadow-black/20" : "hover:scale-105"
                                            )}>
                                                {accent === item.name && <Check className="w-5 h-5 text-white" />}
                                            </div>
                                            <span className={cn(
                                                "text-[10px] transition-colors",
                                                accent === item.name ? "text-primary font-bold" : "text-muted-foreground"
                                            )}>
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-border/50 text-center">
                            <p className="text-[10px] text-muted-foreground italic">Customizations are saved automatically</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
