"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/lib/store/useStore";
import {
  ShieldCheck,
  Calendar,
  MapPin,
  CircleDollarSign,
  ArrowRight,
  Zap,
  BarChart3,
  Users,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  const { isAuthenticated, hasHydrated } = useStore();
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
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="glass px-6 py-4 rounded-3xl flex justify-between items-center shadow-2xl shadow-primary/5 border-border/40">
          <div className="flex items-center space-x-3 group text-foreground">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
              <span className="text-primary-foreground font-black text-xl">P</span>
            </div>
            <span className="font-black text-lg tracking-tighter hidden sm:block">Payroll</span>
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/login" className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              Login
            </Link>
            <Link href="/register">
              <Button className="btn-primary px-8 rounded-2xl h-11">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

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
            An all-in-one platform for attendance, leave management, and automated payroll calculations with precision and elegance.
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
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px]">Premium Dashboard UI Ready</p>
                  </div>
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
          <div className="flex items-center space-x-3 text-foreground/60 grayscale">
            <div className="w-8 h-8 bg-foreground/10 rounded-lg flex items-center justify-center font-black">P</div>
            <span className="text-xs font-black tracking-widest uppercase">Payroll</span>
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