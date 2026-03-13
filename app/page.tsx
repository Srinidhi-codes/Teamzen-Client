"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store/useStore";
import { useTheme } from "next-themes";
import {
  ShieldCheck,
  Calendar,
  MapPin,
  CircleDollarSign,
  ArrowRight,
  Zap,
  BarChart3,
  Users,
  Check,
  Moon,
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ColorAccent } from "@/lib/store/slices/themeSlice";

import { PublicNavbar } from "@/components/common/PublicNavbar";

export default function Home() {
  const { isAuthenticated, hasHydrated, accent, setAccent } = useStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Don't render anything until hydration is complete OR if authenticated
  if (!hasHydrated || isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dynamic Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      {/* Navigation */}
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-44 pb-24 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest animate-slide-up">
            <Zap className="w-3 h-3 mr-2 fill-current" />
            Next-Gen Enterprise Solution
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1] animate-slide-up [animation-delay:200ms]">
            Streamline your <br />
            <span className="bg-linear-to-r from-primary via-primary/80 to-primary/40 bg-clip-text text-transparent">Workflow & Payroll</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed animate-slide-up [animation-delay:400ms]">
            An all-in-one platform for attendance, leave management, and automated payroll calculations with precision, elegance, and <span className="text-primary font-bold">Limitless Customization.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-slide-up [animation-delay:600ms]">
            <Link href="/register">
              <Button className="h-16 px-10 rounded-2xl text-[12px] font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-105 transition-transform group">
                Create Free Account
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="h-16 px-10 rounded-2xl text-[12px] font-black uppercase tracking-widest border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted transition-colors">
                Sign In Now
              </Button>
            </Link>
          </div>

          {/* Dashboard Preview Image Placeholder */}
          <div className="pt-20 animate-slide-up [animation-delay:800ms]">
            <div className="relative group perspective">
              <div className="absolute -inset-1 bg-linear-to-r from-primary to-primary/40 rounded-[4rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-video bg-card/50 backdrop-blur-3xl border border-white/20 rounded-[3rem] shadow-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-20">
                  <Image
                    src="/images/teamzen_zoomed.png"
                    className="w-48 h-48 object-contain animate-pulse-slow"
                    alt="Teamzen Logo"
                    width={192}
                    height={192}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Core Modules</p>
            <h2 className="text-4xl font-black text-foreground tracking-tight">Everything you need</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                color: "from-blue-500/20 to-blue-500/5",
                textColor: "text-blue-500",
                title: "Enterprise Security",
                desc: "JWT-based authentication with advanced role-based access control."
              },
              {
                icon: Calendar,
                color: "from-emerald-500/20 to-emerald-500/5",
                textColor: "text-emerald-500",
                title: "Smart Leaves",
                desc: "Automated leave tracking, balance management and approval cycles."
              },
              {
                icon: MapPin,
                color: "from-orange-500/20 to-orange-500/5",
                textColor: "text-orange-500",
                title: "Geo-Fencing",
                desc: "Accurate attendance tracking with GPS-based location verification."
              },
              {
                icon: CircleDollarSign,
                color: "from-primary/20 to-primary/5",
                textColor: "text-primary",
                title: "Automated Payroll",
                desc: "Precision calculations with automatic deductions and tax handling."
              }
            ].map((feature, i) => (
              <div key={i} className="premium-card card-hover group p-10! text-center md:text-left">
                <div className={cn("w-16 h-16 rounded-2xl bg-linear-to-br flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto md:mx-0", feature.color)}>
                  <feature.icon className={cn("w-8 h-8", feature.textColor)} />
                </div>
                <h3 className="text-xl font-black text-foreground mb-4">{feature.title}</h3>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Theme Experience Section */}
      <section className="py-24 px-6 relative overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              Exclusive Experience
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-none">
              Designed to <br />
              <span className="text-primary italic">Fit Your Vision.</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              We believe software should adapt to you, not the other way around. Experience Teamzen in your preferred aesthetic with our curated system-wide themes.
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {[
                { name: 'indigo', color: 'bg-[#6366f1]' },
                { name: 'green', color: 'bg-[#10b981]' },
                { name: 'blue', color: 'bg-[#3b82f6]' },
                { name: 'red', color: 'bg-[#ef4444]' },
                { name: 'orange', color: 'bg-[#f59e0b]' },
                { name: 'purple', color: 'bg-[#a855f7]' },
                { name: 'slate', color: 'bg-[#475569]' }
              ].map((t) => (
                <button
                  key={t.name}
                  onClick={() => setAccent(t.name as ColorAccent)}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 group",
                    t.color,
                    accent === t.name ? "ring-4 ring-primary/30 scale-110 shadow-xl" : "opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                  )}
                  title={t.name.charAt(0).toUpperCase() + t.name.slice(1)}
                >
                  {accent === t.name && <Check className="w-5 h-5 text-white" />}
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-border/50 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Apperance Mode
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest",
                    theme === 'light' ? "bg-foreground text-background border-foreground" : "bg-background text-foreground border-border hover:border-primary/50"
                  )}
                >
                  <Sun className="w-4 h-4" />
                  White Mode
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest",
                    theme === 'dark' ? "bg-foreground text-background border-foreground" : "bg-background text-foreground border-border hover:border-primary/50"
                  )}
                >
                  <Moon className="w-4 h-4" />
                  Dark Mode
                </button>
              </div>
            </div>
          </div>

          <div className="relative group perspective">
            <div className="absolute -inset-1 bg-linear-to-r from-primary to-primary/40 rounded-[3rem] blur opacity-25"></div>
            <div className="relative aspect-square sm:aspect-video bg-card border border-border/40 rounded-[3rem] shadow-2xl overflow-hidden flex items-center justify-center p-12">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-12 h-12 text-primary animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-foreground capitalize">{accent} Interface Active</h3>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-[10px]">Previewing {theme?.toUpperCase()} {accent?.toUpperCase()} Mode</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 relative overflow-hidden" id="pricing">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Simple & Transparent</p>
            <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">Choice of Champions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Free",
                price: "$0",
                duration: "/month",
                desc: "Efficient basics for startups and small teams.",
                features: ["Up to 10 Employees", "Manual Payroll", "Basic Attendance", "Support Community"],
                plan: "free",
                highlight: false
              },
              {
                name: "Pro",
                price: "$49",
                duration: "/month",
                desc: "Advanced features for growing organizations.",
                features: ["Up to 100 Employees", "Automated Payroll", "Basic AI (Chat)", "Priority Support"],
                plan: "pro",
                highlight: true
              },
              {
                name: "Elite",
                price: "$199",
                duration: "/month",
                desc: "Full-scale solution for high-growth enterprises.",
                features: ["Unlimited Employees", "Full RAG AI Support", "Geo-Fencing Pro", "Dedicated Account Manager"],
                plan: "elite",
                highlight: false
              }
            ].map((tier, i) => (
              <div key={i} className={cn(
                "relative p-8 rounded-[2.5rem] border transition-all duration-500 group hover:-translate-y-2",
                tier.highlight
                  ? "bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/20 scale-105"
                  : "bg-card border-border hover:border-primary/50"
              )}>
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className={cn("text-xl font-black uppercase tracking-widest mb-2", tier.highlight ? "text-primary-foreground" : "text-primary")}>
                      {tier.name}
                    </h3>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl font-black">{tier.price}</span>
                      <span className={cn("text-sm font-bold opacity-60", tier.highlight ? "text-primary-foreground" : "text-muted-foreground")}>{tier.duration}</span>
                    </div>
                  </div>

                  <p className={cn("text-sm font-medium leading-relaxed", tier.highlight ? "text-primary-foreground/80" : "text-muted-foreground")}>
                    {tier.desc}
                  </p>

                  <div className="space-y-4">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", tier.highlight ? "bg-primary-foreground/20" : "bg-primary/10")}>
                          <Check className={cn("w-3 h-3", tier.highlight ? "text-primary-foreground" : "text-primary")} />
                        </div>
                        <span className="text-xs font-bold">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={`/register?plan=${tier.plan}`} className="block pt-4">
                    <Button className={cn(
                      "w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                      tier.highlight
                        ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                        : "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    )}>
                      Select {tier.name}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Numbers */}
      <section className="py-24 px-6 border-y border-border/50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: "Active Users", value: "10K+" },
            { label: "Efficiency Boost", value: "45%" },
            { label: "Success Rate", value: "99.9%" },
            { label: "Client Rating", value: "5.0" }
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <p className="text-4xl font-black text-foreground">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
          <h2 className="text-5xl md:text-6xl font-black text-foreground tracking-tight leading-none">
            Ready to elevate your <br />
            <span className="text-primary italic">HR Experience?</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto">
            Join hundreds of organizations scaling faster with our modern payroll and automation tools.
          </p>
          <div className="pt-6">
            <Link href="/register">
              <Button className="h-20 px-16 rounded-4xl text-[14px] font-black uppercase tracking-widest bg-linear-to-r from-primary to-primary/80 text-primary-foreground shadow-[0_20px_50px_rgba(var(--primary),0.3)] hover:scale-105 transition-all">
                Start Your Journey Now
              </Button>
            </Link>
          </div>
        </div>
        {/* Background Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50 bg-muted/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-3 text-foreground/60 grayscale hover:grayscale-0 transition-all cursor-default group">
            <div className="w-8 h-8 bg-foreground/10 rounded-lg flex items-center justify-center overflow-hidden p-1 border border-border/50 group-hover:border-primary/30">
              <Image
                src="/images/teamzen_zoomed.png"
                alt="Logo"
                width={24}
                height={24}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            <span className="text-xs font-black tracking-widest uppercase">Teamzen</span>
          </div>
          <div className="flex space-x-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Security</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}