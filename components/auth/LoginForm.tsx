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
  Fingerprint,
  Sparkles,
  Globe
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

import { PublicNavbar } from "../common/PublicNavbar";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState("");

  const requestLocation = async (): Promise<{latitude: number, longitude: number} | null> => {
    setIsLocating(true);
    setLocationError("");
    
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          setShowLocationModal(false);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (err) => {
          setIsLocating(false);
          if (err.code === 1) {
            setLocationError("Location is blocked. Please click the Lock icon (🔒) in your address bar and set Location to 'Allow' to continue.");
          } else {
            setLocationError("We couldn't pinpoint your location. Please try again.");
          }
          setShowLocationModal(true);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  };
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
    
    // Try to get location
    const coords = await requestLocation();
    
    if (coords) {
      performLogin(coords.latitude, coords.longitude);
    }
    // If no coords, we stay on this page while the modal is open.
    // The "Skip" button in the modal will now trigger the login without coords.
  };

  const performLogin = async (lat?: number, lon?: number) => {
    try {
      const response = await login.mutateAsync({ 
        email, 
        password,
        latitude: lat ? parseFloat(lat.toFixed(10)) : undefined as any,
        longitude: lon ? parseFloat(lon.toFixed(10)) : undefined as any
      });

      if (response && response.user) {
        loginUser(response.user);
      }

      // 🚀 Use window.location to force a fresh document load.
      window.location.href = "/dashboard";
    } catch (error: any) {
      alert(error.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <PublicNavbar />
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
              disabled={login.isPending || isLocating}
              className="w-full py-3.5 px-4 bg-linear-to-r from-primary to-primary/80 hover:opacity-90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLocating ? (
                <>
                  <Sparkles className="animate-pulse w-5 h-5 text-white" />
                  <span>Syncing Location...</span>
                </>
              ) : login.isPending ? (
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
      
      {/* Location Required Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm glass p-8 rounded-3xl shadow-2xl border border-primary/20 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                <Globe className="w-10 h-10 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Location Required</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To ensure a smooth and secure login flow, we need to verify your entry point. 
                  Please enable location access in your browser settings.
                </p>
              </div>

              {locationError && (
                <div className="p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                  <p className="text-xs text-destructive font-medium">{locationError}</p>
                </div>
              )}

              <div className="pt-2 space-y-3">
                <Button
                  onClick={() => requestLocation()}
                  disabled={isLocating}
                  className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLocating ? (
                    <Loader2 className="animate-spin w-5 h-5 text-white" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>RE-TRY SYNC</span>
                    </>
                  )}
                </Button>
                
                <button
                  onClick={() => performLogin()}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip & Log In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
