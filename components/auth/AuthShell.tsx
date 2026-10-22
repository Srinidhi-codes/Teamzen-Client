"use client";

import Image from "next/image";
import Link from "next/link";
import { AuthImages, BrandImages } from "@/lib/brand-images";
import { cn } from "@/lib/utils";
import { ThemeSelector } from "@/components/common/ThemeSelector";

interface AuthShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  sideImage?: string;
  sideImageAlt?: string;
  sideHeadline?: string;
  sideSubtitle?: string;
  wide?: boolean;
}

function TopographicWaves({ className }: { className?: string }) {
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full opacity-35", className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 800"
      fill="none"
    >
      <path d="M-100 80 C 120 30, 200 280, 460 240 C 720 200, 760 400, 960 360" stroke="#38ABB1" strokeWidth="1.5" />
      <path d="M-100 140 C 140 90, 220 340, 480 300 C 740 260, 780 460, 960 420" stroke="#38ABB1" strokeWidth="1.5" />
      <path d="M-100 200 C 160 150, 240 400, 500 360 C 760 320, 800 520, 960 480" stroke="#38ABB1" strokeWidth="1.5" />
      <path d="M-100 260 C 180 210, 260 460, 520 420 C 780 380, 820 580, 960 540" stroke="#38ABB1" strokeWidth="1.5" />
      <path d="M-100 320 C 200 270, 280 520, 540 480 C 800 440, 840 640, 960 600" stroke="#38ABB1" strokeWidth="1.5" />
      <path d="M-100 380 C 220 330, 300 580, 560 540 C 820 500, 860 700, 960 660" stroke="#38ABB1" strokeWidth="1.5" />
      <path d="M-100 440 C 240 390, 320 640, 580 600 C 840 560, 880 760, 960 720" stroke="#38ABB1" strokeWidth="1.5" />
      <path d="M-100 500 C 260 450, 340 700, 600 660 C 860 620, 900 820, 960 780" stroke="#38ABB1" strokeWidth="1.5" />
      <path d="M-100 560 C 280 510, 360 760, 620 720 C 880 680, 920 880, 960 840" stroke="#38ABB1" strokeWidth="1.5" />
      <circle cx="260" cy="280" r="190" stroke="#38ABB1" strokeWidth="1" strokeDasharray="5 7" opacity="0.45" />
      <circle cx="580" cy="460" r="230" stroke="#38ABB1" strokeWidth="1" strokeDasharray="5 7" opacity="0.45" />
    </svg>
  );
}

export function AuthShell({
  children,
  title = "Login to Your Account",
  description,
  sideImage = AuthImages.dashboard,
  sideImageAlt = "Teamzen workforce analytics and payroll dashboard",
  sideHeadline = "Business Management",
  sideSubtitle = "Streamline operations across departments with one integrated platform that handles everything from workforce attendance to payroll management.",
  wide = false,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen lg:h-screen w-full flex items-center justify-center p-3 sm:p-4 lg:p-4 xl:p-6 bg-[#edf2f7] dark:bg-[#070c14] selection:bg-[#38ABB1]/20 selection:text-[#38ABB1] transition-colors overflow-x-hidden no-scrollbar">
      {/* Ambient background glowing accents */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[650px] w-[650px] rounded-full bg-[#38ABB1]/15 blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[650px] w-[650px] rounded-full bg-[#38ABB1]/15 blur-[160px]" />

      {/* Main 2-Column Auth Card Container */}
      <div
        className={cn(
          "relative w-full rounded-[28px] sm:rounded-[36px] overflow-hidden border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0d1622] shadow-2xl shadow-slate-900/10 dark:shadow-black/70 grid lg:grid-cols-12 min-h-[600px] lg:h-[86vh] lg:min-h-[660px] lg:max-h-[850px] transition-all",
          wide
            ? "max-w-[1640px] 2xl:max-w-[1780px]"
            : "max-w-[1540px] 2xl:max-w-[1680px]"
        )}
      >
        {/* ========================================================
            LEFT COLUMN: Dashboard Showcase with Contour Wave Patterns
           ======================================================== */}
        <aside className="relative hidden lg:col-span-6 xl:col-span-6 overflow-hidden bg-gradient-to-b from-[#0a232c] via-[#0d2e3b] to-[#09151e] lg:flex lg:flex-col lg:justify-between text-white border-r border-slate-200/40 dark:border-white/10 h-full">
          {/* Ambient Glow & Topographic Waves */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-[500px] w-[500px] rounded-full bg-[#38ABB1]/25 blur-[120px]" />
          <div className="pointer-events-none absolute top-1/2 -right-24 h-[440px] w-[440px] rounded-full bg-[#38ABB1]/20 blur-[120px]" />
          <TopographicWaves />

          {/* Top Showcase: Full-Width Dashboard Preview */}
          <div className="relative z-10 w-full flex-1 min-h-[280px] lg:min-h-[340px] xl:min-h-[400px] overflow-hidden group">
            <Image
              src={sideImage}
              alt={sideImageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>

          {/* Bottom Dark Card: Headline, Subtitle & Value Metrics */}
          <div className="relative z-10 bg-[#081118]/95 p-4 sm:p-5 xl:p-6 border-t border-white/10 space-y-2.5">
            <div>
              <h2 className="text-xl xl:text-2xl 2xl:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {sideHeadline}{" "}
                <span className="text-[#38ABB1]">Made Simple</span>
              </h2>
              <p className="mt-1 text-xs xl:text-sm leading-relaxed text-slate-300/80 max-w-xl">
                {sideSubtitle}
              </p>
            </div>

            {/* 3 Metric Value Props filling the space */}
            <div className="grid grid-cols-3 gap-2.5 pt-0.5">
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-2.5 xl:p-3 backdrop-blur-xs">
                <div className="text-sm xl:text-base font-bold text-white">99.8%</div>
                <div className="text-[10px] xl:text-[11px] text-slate-400 leading-tight">Payroll Accuracy</div>
              </div>
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-2.5 xl:p-3 backdrop-blur-xs">
                <div className="text-sm xl:text-base font-bold text-[#38ABB1]">10x</div>
                <div className="text-[10px] xl:text-[11px] text-slate-400 leading-tight">Faster Processing</div>
              </div>
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-2.5 xl:p-3 backdrop-blur-xs">
                <div className="text-sm xl:text-base font-bold text-white">100%</div>
                <div className="text-[10px] xl:text-[11px] text-slate-400 leading-tight">Statutory Compliant</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================
            RIGHT COLUMN: Sleek Auth Form Container
           ======================================================== */}
        <div className="relative flex flex-col justify-between p-5 sm:p-6 md:p-8 xl:p-10 lg:col-span-6 xl:col-span-6 bg-white dark:bg-[#0d1622] transition-colors h-full overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Top Bar: App Logo Badge + Theme Selector */}
          <div
            className={cn(
              "w-full mx-auto flex items-center justify-between pb-3 sm:pb-4",
              wide
                ? "max-w-[580px] xl:max-w-[640px]"
                : "max-w-[500px] xl:max-w-[540px] 2xl:max-w-[560px]"
            )}
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all shadow-xs"
            >
              <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-md">
                <Image
                  src={BrandImages.mark}
                  alt="Teamzen"
                  width={22}
                  height={22}
                  priority
                  className="h-5 w-5 object-contain"
                />
              </div>
              <span className="text-sm font-bold text-foreground tracking-tight group-hover:text-[#38ABB1] transition-colors">
                Teamzen
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <ThemeSelector />
            </div>
          </div>

          {/* Form Main Section */}
          <div
            className={cn(
              "w-full mx-auto my-auto py-1 sm:py-2 flex flex-col justify-center",
              wide
                ? "max-w-[580px] xl:max-w-[640px]"
                : "max-w-[500px] xl:max-w-[540px] 2xl:max-w-[560px]"
            )}
          >
            {/* Title & Description */}
            <div className="mb-4 sm:mb-5">
              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold tracking-tight text-foreground">
                {title}
              </h1>
              {description ? (
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>

            {/* Form Content */}
            <div className="w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
