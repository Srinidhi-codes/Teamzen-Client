"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import {
  Calendar,
  Check,
  Clock,
  Landmark,
  MapPin,
  ScanFace,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store/useStore";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { Reveal } from "@/components/landing/Reveal";
import { LampPull } from "@/components/landing/LampPull";
import { AttendanceWorkflow } from "@/components/landing/AttendanceWorkflow";
import { LeaveWorkflow } from "@/components/landing/LeaveWorkflow";
import { PayrollWorkflow } from "@/components/landing/PayrollWorkflow";
import { AiCopilotShowcase } from "@/components/landing/AiCopilotShowcase";
import { EverywhereShowcase } from "@/components/landing/EverywhereShowcase";
import { BrandImages } from "@/lib/brand-images";

const tiers = [
  {
    name: "Free",
    price: "₹0",
    duration: "/month",
    desc: "Basics for small teams getting started.",
    features: ["Up to 10 employees", "Manual payroll", "Basic attendance", "Policies", "Light & dark mode"],
    plan: "free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹3,999",
    duration: "/month",
    desc: "Advanced tools for growing organizations.",
    features: ["Up to 100 employees", "Automated payroll", "AI assistant", "AI write", "Color themes", "Face attendance", "Priority support"],
    plan: "pro",
    highlight: true,
  },
  {
    name: "Elite",
    price: "₹14,999",
    duration: "/month",
    desc: "Full suite for larger enterprises.",
    features: [
      "Unlimited employees",
      "Performance & analytics",
      "Full RAG AI support",
      "Dedicated account manager",
    ],
    plan: "elite",
    highlight: false,
  },
];

const values = [
  {
    icon: ScanFace,
    title: "Check in that proves itself",
    copy: "Face match, geofence, and timestamp in one tap — then the week view fills itself.",
  },
  {
    icon: Calendar,
    title: "Leave without the chase",
    copy: "Balances, calendar, and manager approval stay in the same thread.",
  },
  {
    icon: Wallet,
    title: "Payslips that read clearly",
    copy: "Earnings, deductions, and net pay land with a trail finance does not have to explain twice.",
  },
];

export function LandingPage() {
  const { isAuthenticated, hasHydrated, logoutUser } = useStore();

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
    <div className="landing-root min-h-screen bg-[var(--landing-bg)] text-foreground">
      <LandingNavbar showDashboardCta={showDashboardCta} />

      <header className="relative isolate overflow-hidden pt-14 sm:pt-16">
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
              Attendance, leave, and payroll in one calm workspace built for people ops that stay in balance.
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
                    className="inline-flex h-11 items-center justify-center rounded-md border border-border/80 bg-white/50 px-7 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>

            <div className="landing-hero-item landing-hero-item-4 mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground sm:gap-3 sm:text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-2.5 py-1 backdrop-blur-sm">
                <ScanFace className="h-3 w-3 text-primary" />
                Face attendance
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-2.5 py-1 backdrop-blur-sm">
                <MapPin className="h-3 w-3 text-primary" />
                Geo-fencing
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-2.5 py-1 backdrop-blur-sm">
                <Landmark className="h-3 w-3 text-primary" />
                Automated payroll
              </span>
            </div>
          </div>

          <div
            id="product"
            className="landing-hero-item landing-hero-item-5 relative mt-12 scroll-mt-20 sm:mt-16"
          >
            <div className="landing-preview-glow" aria-hidden />
            <aside className="landing-float-card landing-float-card--left hidden lg:flex">
              <ScanFace className="h-3.5 w-3.5 text-primary" />
              Face match 98%
            </aside>
            <aside className="landing-float-card landing-float-card--right hidden lg:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Inside geofence
            </aside>
            <DashboardPreview />
          </div>
        </div>
      </header>

      <section className="border-t border-border/60 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3">
          {values.map((item, index) => (
            <Reveal key={item.title} delay={index * 80}>
              <div className="h-full rounded-2xl border border-border bg-card/80 p-5">
                <item.icon className="h-5 w-5 text-primary" />
                <h2 className="mt-4 text-base font-semibold tracking-tight">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="modules" className="scroll-mt-16 border-t border-border/60 px-4 py-16 sm:scroll-mt-20 sm:px-6 sm:py-20 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-10 xl:grid-cols-2 xl:gap-16">
          <Reveal>
            <p className="mb-3 text-sm font-medium tracking-wide text-primary">
              Attendance
            </p>
            <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Check in once.
              <br />
              Watch the proof assemble.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Tap check-in and the same path employees use every morning plays
              out: face scan, office radius, then a timestamp you can trust.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Live status
              </span>
              <span className="inline-flex items-center gap-2">
                <ScanFace className="h-4 w-4 text-primary" />
                Face recognition
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Geo-fencing
              </span>
            </div>
          </Reveal>

          <Reveal delay={120} media from="right" className="landing-module-panel">
            <AttendanceWorkflow />
          </Reveal>
        </div>
      </section>

      <section className="landing-band px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
        <LeaveWorkflow />
      </section>

      <section className="border-t border-border/60 px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-10 xl:grid-cols-2 xl:gap-16">
          <Reveal>
            <p className="mb-3 text-sm font-medium tracking-wide text-primary">
              Payroll
            </p>
            <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              From run to payslip without the fog.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Watch a cycle calculate, validate earnings and deductions, then
              publish a payslip that already looks finished.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Auto calculations
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Clear breakdowns
              </span>
            </div>
          </Reveal>

          <Reveal delay={120} media from="right" className="landing-module-panel">
            <PayrollWorkflow />
          </Reveal>
        </div>
      </section>

      <section className="ai-showcase-section border-t border-border/60 px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <AiCopilotShowcase />
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 sm:py-12">
        <EverywhereShowcase />
      </section>

      <section className="border-t border-border/60 px-4 pb-16 sm:px-6 sm:pb-20 lg:pb-28">
        <div className="mx-auto max-w-3xl">
          <div className="flex justify-center">
            <LampPull />
          </div>

          <Reveal className="text-center">
            <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
              Light or dark
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Pull the cord to switch. Your company color is set by your admin.
            </p>
          </Reveal>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-16 border-t border-border/60 px-4 py-16 sm:scroll-mt-20 sm:px-6 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <Reveal className="text-center">
            <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight sm:text-5xl">
              Simple plans
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Scale with your team. No surprise add-ons. Compare every plan at a glance.
            </p>
          </Reveal>

          <div className="plan-deck landing-pricing-grid mt-14">
            {tiers.map((tier) => (
              <div
                key={tier.plan}
                data-plan={tier.plan}
                className={cn(
                  "landing-pricing-card plan-deck-card relative flex h-full flex-col rounded-2xl border p-6",
                  tier.highlight
                    ? "landing-pricing-card--featured border-foreground bg-foreground text-background"
                    : "border-border bg-card"
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
                    "mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-md text-sm font-medium transition-opacity hover:opacity-90",
                    tier.highlight
                      ? "bg-background text-foreground"
                      : "bg-foreground text-background"
                  )}
                >
                  Select {tier.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <Reveal>
          <div className="landing-cta mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 rounded-3xl border border-border bg-card px-6 py-10 sm:px-10 sm:py-12 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready to run people ops with less noise?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Start on Free, then turn on face attendance and automated payroll
                when the team is ready.
              </p>
            </div>
            {showDashboardCta ? (
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-7 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Go to dashboard
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-7 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Start free
              </Link>
            )}
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border/60 px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-card ring-1 ring-border">
              <Image
                src={BrandImages.mark}
                alt="Teamzen"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
                loading="lazy"
                decoding="async"
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
            <a href="mailto:connectifyappmails@gmail.com" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
