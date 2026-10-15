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
  sideHeadline = "Business Management Made Simple",
  sideSubtitle = "Streamline operations across departments with one integrated platform that handles everything from workforce attendance to payroll management.",
  wide = false,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-8 xl:p-12 bg-[#edf2f7] dark:bg-[#070c14] selection:bg-[#38ABB1]/20 selection:text-[#38ABB1] transition-colors">
      {/* Ambient background glowing accents */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[550px] w-[550px] rounded-full bg-[#38ABB1]/12 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[550px] w-[550px] rounded-full bg-[#38ABB1]/12 blur-[140px]" />

      {/* Main 2-Column Auth Card Container */}
      <div className="relative w-full max-w-[1200px] xl:max-w-[1260px] rounded-[32px] sm:rounded-[36px] overflow-hidden border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0d1622] shadow-2xl shadow-slate-900/10 dark:shadow-black/70 grid lg:grid-cols-12 min-h-[660px]">
        
        {/* ========================================================
            LEFT COLUMN: Dashboard Showcase with Contour Wave Patterns
           ======================================================== */}
        <aside className="relative hidden lg:col-span-6 xl:col-span-6 overflow-hidden bg-gradient-to-b from-[#0a232c] via-[#0d2e3b] to-[#09151e] lg:flex lg:flex-col lg:justify-between text-white border-r border-slate-200/40 dark:border-white/10">
          {/* Ambient Glow & Topographic Waves */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-[450px] w-[450px] rounded-full bg-[#38ABB1]/25 blur-[110px]" />
          <div className="pointer-events-none absolute top-1/2 -right-24 h-[380px] w-[380px] rounded-full bg-[#38ABB1]/20 blur-[110px]" />
          <TopographicWaves />

          {/* Top Showcase: Wide Clean Dashboard Mockup (takes full width) */}
          <div className="relative z-10 w-full flex-1 flex items-center justify-center p-5 xl:p-7 pt-7">
            <div className="relative w-full h-[340px] xl:h-[390px] rounded-2xl xl:rounded-3xl overflow-hidden border border-white/20 bg-slate-950/80 shadow-2xl shadow-black/70 group">
              <Image
                src={sideImage}
                alt={sideImageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
              />
              {/* Subtle glass reflection overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-white/10" />
            </div>
          </div>

          {/* Bottom Dark Card: Bold Headline & Subtitle */}
          <div className="relative z-10 bg-[#081118] p-7 xl:p-9 border-t border-white/10 space-y-2.5">
            <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Business Management <br className="hidden sm:inline" />
              <span className="text-[#38ABB1]">Made Simple</span>
            </h2>
            <p className="text-xs xl:text-sm leading-relaxed text-slate-300/80 max-w-md">
              {sideSubtitle}
            </p>
          </div>
        </aside>

        {/* ========================================================
            RIGHT COLUMN: Sleek Auth Form Container
           ======================================================== */}
        <div className="relative flex flex-col justify-between p-6 sm:p-9 xl:p-12 lg:col-span-6 xl:col-span-6 bg-white dark:bg-[#0d1622] transition-colors">
          <div className="w-full max-w-[430px] mx-auto flex-1 flex flex-col justify-center">
            
            {/* Top Bar: App Logo Badge + Theme Selector */}
            <div className="flex items-center justify-between mb-5">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all shadow-xs"
              >
                <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-md">
                  <Image
                    src={BrandImages.mark}
                    alt="Teamzen"
                    width={20}
                    height={20}
                    priority
                    className="h-4 w-4 object-contain"
                  />
                </div>
                <span className="text-xs font-bold text-foreground tracking-tight group-hover:text-[#38ABB1] transition-colors">
                  Teamzen
                </span>
              </Link>

              <div className="flex items-center gap-2">
                <ThemeSelector />
              </div>
            </div>

            {/* Title & Description */}
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {title}
              </h1>
              {description ? (
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{description}</p>
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
