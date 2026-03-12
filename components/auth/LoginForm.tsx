"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/api/hooks";
import { useStore } from "@/lib/store/useStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Fingerprint
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { loginUser, isAuthenticated, hasHydrated } = useStore();

  // 🛡️ Guard: If already authenticated, bypass login
  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login.mutateAsync({ email, password });

      // Update global store - transformation happens inside the slice!
      if (response && response.user) {
        loginUser(response.user);
      }

      // 🚀 Use window.location to force a fresh document load.
      // This ensures HttpOnly cookies are fully propagated and Apollo Client is completely re-initialized.
      window.location.href = "/dashboard";
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-24 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="animate-fade-in text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 shadow-xl shadow-primary/5 mb-6 transform transition-transform duration-300 overflow-hidden p-3 backdrop-blur-sm">
            <Image
              src="/images/teamzen_zoomed.png"
              alt="Teamzen"
              width={64}
              height={64}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Teamzen User Portal</h2>
          <p className="mt-2 text-sm text-muted-foreground font-medium uppercase tracking-widest">Verified access session</p>
        </div>

        <div className="glass p-8 rounded-3xl animate-slide-up bg-linear-to-b from-primary/10 via-primary/5">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Field */}
              <Input
                id="email-address"
                label="Email Address"
                name="email"
                type="email"
                required
                icon={<Mail className="h-4 w-4" />}
                placeholder="you@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Password Field */}
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                icon={<Lock className="h-4 w-4" />}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-border bg-card text-primary focus:ring-primary cursor-pointer" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
              </label>
              <Link href="/forgot-password" title="Forgot Password?" className="text-sm font-medium text-primary hover:opacity-80 no-underline transition-colors">
                Recover access?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={login.isPending}
              className="w-full py-3.5 px-4 bg-linear-to-r from-primary to-primary/80 hover:opacity-90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {login.isPending ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400">
          &copy; 2025 Teamzen Pvt. Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
}
