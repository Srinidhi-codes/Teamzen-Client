"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/lib/store/useStore";
import { useTheme } from "next-themes";
import {
  Calendar,
  MapPin,
  CircleDollarSign,
  Clock,
  Check,
  Moon,
  Sun,
  Users,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ColorAccent } from "@/lib/store/slices/themeSlice";
import { PublicNavbar } from "@/components/common/PublicNavbar";

export default function Home() {
  const { isAuthenticated, hasHydrated, accent, setAccent } = useStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Redirect logged-in users to the dashboard after store hydrates
  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Always paint the marketing shell; auth CTA updates after hydration
  const showDashboardCta = hasHydrated && isAuthenticated;

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero */}
      <section className="px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-card ring-1 ring-border">
              <Image
                src="/images/teamzen_zoomed.png"
                alt="Teamzen"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
                priority
              />
            </div>
          </div>

          <p className="mb-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Teamzen
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-4xl">
            Payroll and workforce tools for modern teams
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Track attendance, manage leave, and run payroll from one calm, reliable workspace.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {showDashboardCta ? (
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Everything in one place
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The essentials your team needs day to day.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Clock,
                title: "Attendance",
                desc: "Check in and out with location-aware tracking.",
              },
              {
                icon: Calendar,
                title: "Leave",
                desc: "Request time off and track balances with clear approvals.",
              },
              {
                icon: CircleDollarSign,
                title: "Payroll",
                desc: "View payslips and automated salary calculations.",
              },
              {
                icon: MapPin,
                title: "Geo-fencing",
                desc: "Verify presence with GPS-based location checks.",
              },
              {
                icon: Users,
                title: "Team",
                desc: "Stay aligned with org structure and roles.",
              },
              {
                icon: FileText,
                title: "Documents",
                desc: "Access policies, notices, and shared files.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Theme / accent picker */}
      <section className="border-t border-border px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Appearance
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose an accent color and light or dark mode.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">Accent</p>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { name: "teal", color: "bg-[#0d9488]" },
                  { name: "slate", color: "bg-[#475569]" },
                  { name: "blue", color: "bg-[#3b82f6]" },
                  { name: "green", color: "bg-[#10b981]" },
                  { name: "indigo", color: "bg-[#6366f1]" },
                  { name: "orange", color: "bg-[#f59e0b]" },
                  { name: "red", color: "bg-[#ef4444]" },
                  { name: "purple", color: "bg-[#a855f7]" },
                ].map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setAccent(t.name as ColorAccent)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md transition-opacity",
                      t.color,
                      hasHydrated && accent === t.name
                        ? "ring-2 ring-foreground/20 ring-offset-2 ring-offset-background"
                        : "opacity-70 hover:opacity-100"
                    )}
                    title={t.name.charAt(0).toUpperCase() + t.name.slice(1)}
                    aria-label={`${t.name} accent`}
                  >
                    {hasHydrated && accent === t.name && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <p className="mb-3 text-sm font-medium text-foreground">Theme</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors",
                    hasHydrated && theme === "light"
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  <Sun className="h-4 w-4" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors",
                    hasHydrated && theme === "dark"
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border px-4 py-16 sm:px-6" id="pricing">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Pricing
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Simple plans that scale with your team.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                name: "Free",
                price: "$0",
                duration: "/month",
                desc: "Basics for small teams getting started.",
                features: ["Up to 10 employees", "Manual payroll", "Basic attendance", "Community support"],
                plan: "free",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$49",
                duration: "/month",
                desc: "Advanced tools for growing organizations.",
                features: ["Up to 100 employees", "Automated payroll", "Basic AI chat", "Priority support"],
                plan: "pro",
                highlight: true,
              },
              {
                name: "Elite",
                price: "$199",
                duration: "/month",
                desc: "Full suite for larger enterprises.",
                features: ["Unlimited employees", "Full RAG AI support", "Geo-fencing pro", "Dedicated account manager"],
                plan: "elite",
                highlight: false,
              },
            ].map((tier) => (
              <div
                key={tier.plan}
                className={cn(
                  "relative flex flex-col rounded-xl border p-6",
                  tier.highlight
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card"
                )}
              >
                {tier.highlight && (
                  <span className="absolute -top-2.5 left-4 rounded-md bg-foreground px-2 py-0.5 text-xs font-medium text-background">
                    Popular
                  </span>
                )}

                <div className="mb-1">
                  <h3 className="text-sm font-semibold">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold">{tier.price}</span>
                    <span
                      className={cn(
                        "text-sm",
                        tier.highlight ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {tier.duration}
                    </span>
                  </div>
                </div>

                <p
                  className={cn(
                    "mt-2 text-sm leading-relaxed",
                    tier.highlight ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}
                >
                  {tier.desc}
                </p>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          tier.highlight ? "text-primary-foreground" : "text-primary"
                        )}
                      />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/register?plan=${tier.plan}`}
                  className={cn(
                    "mt-6 inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-medium transition-colors",
                    tier.highlight
                      ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  Select {tier.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-card ring-1 ring-border">
              <Image
                src="/images/teamzen_zoomed.png"
                alt="Teamzen"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
                loading="lazy"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Teamzen
            </span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
