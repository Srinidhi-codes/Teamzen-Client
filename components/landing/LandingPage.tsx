"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Calendar,
  Check,
  CircleDollarSign,
  Clock,
  MapPin,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store/useStore";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { Reveal } from "@/components/landing/Reveal";

const tiers = [
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
    features: [
      "Unlimited employees",
      "Full RAG AI support",
      "Geo-fencing pro",
      "Dedicated account manager",
    ],
    plan: "elite",
    highlight: false,
  },
];

export function LandingPage() {
  const { isAuthenticated, hasHydrated, logoutUser } = useStore();
  const { theme, setTheme } = useTheme();

  // Clear stale localStorage auth when cookies are gone (prevents fake "Go to dashboard")
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && !data?.authenticated) logoutUser();
      } catch {
        /* ignore network blips on marketing page */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, isAuthenticated, logoutUser]);

  const showDashboardCta = hasHydrated && isAuthenticated;

  return (
    <div className="landing-root min-h-screen overflow-x-hidden bg-[var(--landing-bg)] text-foreground">
      <LandingNavbar showDashboardCta={showDashboardCta} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="relative isolate pt-14 sm:pt-16">
        <div className="landing-hero-atmosphere" aria-hidden />
        <div className="landing-hero-grid" aria-hidden />

        <div className="relative mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-6xl flex-col justify-end px-4 pb-8 pt-16 sm:min-h-[calc(100svh-4rem)] sm:px-6 sm:pb-12 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="landing-hero-item landing-hero-item-1 mb-5 font-[family-name:var(--font-landing-display)] text-5xl font-semibold tracking-tight text-foreground sm:text-7xl md:text-8xl">
              Teamzen
            </p>
            <h1 className="landing-hero-item landing-hero-item-2 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
              Workforce clarity for modern teams
            </h1>
            <p className="landing-hero-item landing-hero-item-3 mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Attendance, leave, and payroll in one calm workspace — built for
              people ops that stay in balance.
            </p>

            <div className="landing-hero-item landing-hero-item-4 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {showDashboardCta ? (
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-7 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-7 text-sm font-medium text-background transition-opacity hover:opacity-90"
                  >
                    Start free
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-11 items-center justify-center rounded-md border border-border/80 bg-white/50 px-7 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-white/80"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>

          <div
            id="product"
            className="landing-hero-item landing-hero-item-5 relative mt-14 sm:mt-16"
          >
            <div className="landing-preview-glow" aria-hidden />
            <DashboardPreview />
          </div>
        </div>
      </header>

      {/* ── Modules: Attendance ──────────────────────────────── */}
      <section id="modules" className="border-t border-border/60 px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="mb-3 text-sm font-medium tracking-wide text-primary">
              Attendance
            </p>
            <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Check in once.
              <br />
              Know the whole week.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Location-aware attendance with a week view that feels as clear as
              your calendar. Geo-fencing when you need proof — quiet when you
              don&apos;t.
            </p>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Live status
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Geo-fencing
              </span>
            </div>
          </Reveal>

          <Reveal delay={120} className="landing-module-panel">
            <div className="space-y-0 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {[
                { day: "Mon", label: "Present", tone: "bg-emerald-500", time: "09:02" },
                { day: "Tue", label: "Present", tone: "bg-emerald-500", time: "08:58" },
                { day: "Wed", label: "On leave", tone: "bg-orange-400", time: "—" },
                { day: "Thu", label: "Present", tone: "bg-emerald-500", time: "09:11" },
                { day: "Fri", label: "Pending", tone: "bg-amber-400", time: "Today", active: true },
              ].map((row) => (
                <div
                  key={row.day}
                  className={cn(
                    "flex items-center justify-between px-5 py-4",
                    row.active && "bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn("h-2 w-2 rounded-full", row.tone)} />
                    <div>
                      <p className="text-sm font-semibold">{row.day}</p>
                      <p className="text-xs text-muted-foreground">{row.label}</p>
                    </div>
                  </div>
                  <p className="text-sm tabular-nums text-muted-foreground">{row.time}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Modules: Leave ───────────────────────────────────── */}
      <section className="landing-band px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
              <p className="text-sm text-teal-200/80">Leave available</p>
              <p className="mt-2 font-[family-name:var(--font-landing-display)] text-6xl font-semibold tracking-tight text-white tabular-nums sm:text-7xl">
                19
                <span className="ml-2 text-xl font-medium text-white/50">days</span>
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { name: "Annual", pct: 67 },
                  { name: "Sick", pct: 63 },
                  { name: "Casual", pct: 50 },
                ].map((b) => (
                  <div key={b.name}>
                    <div className="mb-1.5 flex justify-between text-sm text-white/70">
                      <span>{b.name}</span>
                      <span>{b.pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-teal-300 landing-bar-grow"
                        style={{ width: `${b.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={100} className="order-1 lg:order-2">
            <p className="mb-3 text-sm font-medium tracking-wide text-teal-200">
              Leave
            </p>
            <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
              Balances you can trust.
              Approvals that move.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65 sm:text-base">
              Request time off, track every balance, and keep managers in the
              loop — without the spreadsheet chase.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 text-sm text-white/70">
              <Calendar className="h-4 w-4 text-teal-200" />
              Requests, balances, and team calendar
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Modules: Payroll ─────────────────────────────────── */}
      <section className="border-t border-border/60 px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-medium tracking-wide text-primary">
              Payroll
            </p>
            <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Payslips that feel finished.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              Automated calculations, clear breakdowns, and a payroll trail your
              team can open without asking finance twice.
            </p>
          </Reveal>

          <Reveal delay={120} className="mx-auto mt-14 max-w-3xl">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2.5">
                  <CircleDollarSign className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">July 2026 payslip</p>
                </div>
                <span className="text-xs font-medium text-emerald-600">Paid</span>
              </div>
              <div className="grid gap-6 p-5 sm:grid-cols-3 sm:p-6">
                {[
                  { label: "Gross", value: "$6,400" },
                  { label: "Deductions", value: "$1,120" },
                  { label: "Net pay", value: "$5,280" },
                ].map((row) => (
                  <div key={row.label}>
                    <p className="text-xs text-muted-foreground">{row.label}</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Appearance ───────────────────────────────────────── */}
      <section className="border-t border-border/60 px-4 py-24 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
              Light or dark
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Switch appearance anytime. Your company color is set by your admin.
            </p>
          </Reveal>

          <Reveal delay={100} className="mt-10 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors",
                hasHydrated && theme === "light"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background/60 text-foreground hover:bg-muted"
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
                  : "border-border bg-background/60 text-foreground hover:bg-muted"
              )}
            >
              <Moon className="h-4 w-4" />
              Dark
            </button>
          </Reveal>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="border-t border-border/60 px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <Reveal className="text-center">
            <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight sm:text-5xl">
              Simple plans
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Scale with your team — no surprise add-ons.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {tiers.map((tier, i) => (
              <Reveal key={tier.plan} delay={i * 90}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-2xl border p-6",
                    tier.highlight
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card/80"
                  )}
                >
                  {tier.highlight && (
                    <span className="absolute -top-2.5 left-4 rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                      Popular
                    </span>
                  )}

                  <h3 className="text-sm font-semibold">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight">
                      {tier.price}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        tier.highlight ? "text-background/60" : "text-muted-foreground"
                      )}
                    >
                      {tier.duration}
                    </span>
                  </div>

                  <p
                    className={cn(
                      "mt-3 text-sm leading-relaxed",
                      tier.highlight ? "text-background/70" : "text-muted-foreground"
                    )}
                  >
                    {tier.desc}
                  </p>

                  <ul className="mt-6 flex-1 space-y-2.5">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check
                          className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            tier.highlight ? "text-background" : "text-primary"
                          )}
                        />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/register?plan=${tier.plan}`}
                    className={cn(
                      "mt-6 inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-medium transition-opacity hover:opacity-90",
                      tier.highlight
                        ? "bg-background text-foreground"
                        : "bg-foreground text-background"
                    )}
                  >
                    Select {tier.name}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-border/60 px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
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
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <a href={`mailto:connectifyappmails@gmail.com`} className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
