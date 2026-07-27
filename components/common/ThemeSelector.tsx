"use client";

import { useTheme } from "next-themes";
import { useStore } from "@/lib/store/useStore";
import { ColorAccent } from "@/lib/store/slices/themeSlice";
import { Check, Palette, Moon, Sun, Monitor } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const accents: { name: ColorAccent; color: string; label: string }[] = [
  { name: "teal", color: "#0F766E", label: "Teal" },
  { name: "slate", color: "#475569", label: "Slate" },
  { name: "blue", color: "#2563EB", label: "Blue" },
  { name: "green", color: "#16A34A", label: "Green" },
  { name: "indigo", color: "#4F46E5", label: "Indigo" },
  { name: "orange", color: "#EA580C", label: "Orange" },
  { name: "red", color: "#DC2626", label: "Red" },
  { name: "purple", color: "#7C3AED", label: "Purple" },
];

export function ThemeSelector() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { accent, setAccent } = useStore();
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Appearance"
          aria-label="Appearance settings"
        >
          <Palette className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 p-3">
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Theme</p>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "light", icon: Sun, label: "Light" },
                { id: "dark", icon: Moon, label: "Dark" },
                { id: "system", icon: Monitor, label: "System" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-md border px-2 py-2.5 text-xs transition-colors",
                    theme === t.id
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Accent</p>
            <div className="flex flex-wrap gap-2">
              {accents.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setAccent(item.name)}
                  title={item.label}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full transition-shadow",
                    accent === item.name && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  style={{ backgroundColor: item.color }}
                  aria-label={item.label}
                >
                  {accent === item.name && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label className="text-sm font-medium">High contrast</Label>
                <p className="text-xs text-muted-foreground">Stronger borders and text</p>
              </div>
              <Switch checked={highContrast} onCheckedChange={setHighContrast} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label className="text-sm font-medium">Reduced motion</Label>
                <p className="text-xs text-muted-foreground">Limit animations</p>
              </div>
              <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
