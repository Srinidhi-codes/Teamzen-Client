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
  Sparkles,
  Globe,
  KeyRound,
  ShieldCheck,
  Chrome
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

  // New states for extended auth
  const [authType, setAuthType] = useState<"password" | "otp">("password");
  const [step, setStep] = useState<"login" | "otp_code" | "totp">("login");
  const [otpCode, setOtpCode] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [countdown, setCountdown] = useState(0);

  const { login, requestOtp, verifyOtp, verifyTotp, googleLogin } = useAuth();
  const { loginUser, isAuthenticated, hasHydrated } = useStore();
  const router = useRouter();

  // Load Google Identity Services script dynamically
  useEffect(() => {
    if (step !== "login") return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      const google = (window as any).google;
      if (google) {
        google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1016839352936-google-placeholder.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { 
            theme: "outline", 
            size: "large", 
            width: 360,
            text: "signin_with",
            shape: "pill"
          }
        );
      }
    };

    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {}
    };
  }, [step, authType]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // 🛡️ Guard: If already authenticated, redirect to dashboard
  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, router]);

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
            setLocationError("Location is blocked. Please allow Location access in your browser settings to log check-ins accurately.");
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

  const handleGoogleCredentialResponse = async (response: any) => {
    const idToken = response.credential;
    const coords = await requestLocation();
    try {
      const loginResult = await googleLogin.mutateAsync({
        id_token: idToken,
        latitude: coords?.latitude,
        longitude: coords?.longitude
      });
      
      if (loginResult.totp_required) {
        setTempToken(loginResult.temp_token);
        setStep("totp");
      } else if (loginResult.user) {
        loginUser(loginResult.user);
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      alert(err.message || "Google Sign-In failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authType === "otp") {
      if (step === "login") {
        // Send OTP code
        try {
          await requestOtp.mutateAsync(email);
          setStep("otp_code");
          setCountdown(60);
        } catch (error: any) {
          alert(error.message || "Failed to send verification code");
        }
      } else if (step === "otp_code") {
        // Verify OTP code
        const coords = await requestLocation();
        try {
          const result = await verifyOtp.mutateAsync({
            email,
            otp: otpCode,
            latitude: coords?.latitude,
            longitude: coords?.longitude
          });

          if (result.totp_required) {
            setTempToken(result.temp_token);
            setStep("totp");
          } else if (result.user) {
            loginUser(result.user);
            window.location.href = "/dashboard";
          }
        } catch (error: any) {
          alert(error.message || "Invalid OTP code");
        }
      }
    } else {
      // Standard Password Login
      const coords = await requestLocation();
      if (coords) {
        performLogin(coords.latitude, coords.longitude);
      }
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      await requestOtp.mutateAsync(email);
      setCountdown(60);
    } catch (error: any) {
      alert(error.message || "Failed to send code");
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode) return;
    const coords = await requestLocation();
    try {
      const result = await verifyTotp.mutateAsync({
        temp_token: tempToken,
        code: totpCode,
        latitude: coords?.latitude,
        longitude: coords?.longitude
      });
      if (result.user) {
        loginUser(result.user);
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      alert(error.message || "Invalid authenticator code");
    }
  };

  const performLogin = async (lat?: number, lon?: number) => {
    try {
      const response = await login.mutateAsync({ 
        email, 
        password,
        latitude: lat ? parseFloat(lat.toFixed(10)) : undefined,
        longitude: lon ? parseFloat(lon.toFixed(10)) : undefined
      });

      if (response && response.totp_required) {
        setTempToken(response.temp_token);
        setStep("totp");
        return;
      }

      if (response && response.user) {
        loginUser(response.user);
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      alert(error.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center login-bg py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <PublicNavbar />
      
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-[440px] w-full space-y-8 relative z-10">
        <div className="glass-login p-10 rounded-[32px] animate-slide-up">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 shadow-xl mb-4 overflow-hidden p-2.5">
              <Image
                src="/images/teamzen_zoomed.png"
                alt="Teamzen"
                width={48}
                height={48}
                className="w-full h-full object-contain brightness-110"
                loading="lazy"
              />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Teamzen Portal</h2>
            <p className="mt-1 text-[10px] text-white/50 uppercase tracking-widest font-semibold">Verified Enterprise Session</p>
          </div>

          {/* Form Content Router */}
          {step === "totp" ? (
            /* ================== TOTP screen ================== */
            <form onSubmit={handleVerifyTotp} className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white">2-Factor Verification</h3>
                <p className="text-xs text-white/50">
                  Enter the 6-digit verification code generated by your Authenticator app.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest px-1">Security Code</label>
                <Input
                  id="totp-code"
                  name="code"
                  type="text"
                  required
                  maxLength={6}
                  icon={<KeyRound className="h-4 w-4" />}
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  className="bg-white/5 border-white/10 text-center tracking-widest text-lg font-mono focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-white/20 h-[52px] rounded-2xl"
                />
              </div>

              <Button
                type="submit"
                disabled={verifyTotp.isPending}
                className="w-full h-[52px] bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                {verifyTotp.isPending ? (
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                ) : (
                  <>
                    <span>VERIFY & SIGN IN</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => { setStep("login"); setTotpCode(""); }}
                className="w-full text-center text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Cancel and return to login
              </button>
            </form>
          ) : (
            /* ================== Standard Login / OTP Input ================== */
            <>
              {/* Type Selector (Password vs OTP) */}
              {step === "login" && (
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 mb-6">
                  <button
                    type="button"
                    onClick={() => setAuthType("password")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      authType === "password"
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthType("otp")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      authType === "otp"
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    Email OTP
                  </button>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                {step === "login" ? (
                  /* Screen 1: Inputs Email / Password */
                  <div className="space-y-5">
                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest px-1">Email Address</label>
                      <Input
                        id="email-address"
                        name="email"
                        type="email"
                        required
                        icon={<Mail className="h-4 w-4" />}
                        placeholder="you@organization.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-white/20 h-[52px] rounded-2xl"
                      />
                    </div>

                    {/* Password (Only for password flow) */}
                    {authType === "password" && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest px-1">Password</label>
                        <div className="relative">
                          <Input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            icon={<Lock className="h-4 w-4" />}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-white/20 h-[52px] rounded-2xl"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/30 hover:text-white/60 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Screen 2: OTP Verification input */
                  <div className="space-y-5">
                    <div className="text-center space-y-1.5 mb-4">
                      <div className="mx-auto w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-purple-400" />
                      </div>
                      <h3 className="text-md font-bold text-white">Enter OTP Code</h3>
                      <p className="text-xs text-white/50">
                        We sent a 6-digit login code to <strong>{email}</strong>
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest px-1">Verification Code</label>
                      <Input
                        id="otp-code"
                        name="otp"
                        type="text"
                        required
                        maxLength={6}
                        icon={<KeyRound className="h-4 w-4" />}
                        placeholder="000000"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        className="bg-white/5 border-white/10 text-center tracking-widest text-lg font-mono focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-white/20 h-[52px] rounded-2xl"
                      />
                    </div>

                    <div className="text-center">
                      {countdown > 0 ? (
                        <span className="text-xs text-white/40">Resend code in {countdown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Submits buttons */}
                {authType === "password" ? (
                  /* Standard login button */
                  <Button
                    type="submit"
                    disabled={login.isPending || isLocating}
                    className="w-full h-[52px] bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg transform active:scale-[0.98] transition-all disabled:opacity-75 flex items-center justify-center space-x-2 group"
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
                ) : (
                  /* OTP flow button */
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      disabled={requestOtp.isPending || verifyOtp.isPending || isLocating}
                      className="w-full h-[52px] bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2"
                    >
                      {requestOtp.isPending || verifyOtp.isPending ? (
                        <Loader2 className="animate-spin h-5 w-5 text-white" />
                      ) : step === "login" ? (
                        <span>SEND CODE</span>
                      ) : (
                        <span>VERIFY & SIGN IN</span>
                      )}
                    </Button>

                    {step === "otp_code" && (
                      <button
                        type="button"
                        onClick={() => { setStep("login"); setOtpCode(""); }}
                        className="w-full text-center text-xs text-white/40 hover:text-white/60 transition-colors"
                      >
                        Change Email Address
                      </button>
                    )}
                  </div>
                )}
              </form>

              {/* Password Recovery link */}
              {step === "login" && authType === "password" && (
                <div className="flex justify-end mt-4 px-1">
                  <Link href="/forgot-password" className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                    Forgot Password?
                  </Link>
                </div>
              )}

              {/* Google Sign-in section */}
              {step === "login" && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between text-[10px] text-white/30 uppercase tracking-widest font-bold">
                    <span className="h-[1px] bg-white/10 flex-1"></span>
                    <span className="px-3">Or sign in with</span>
                    <span className="h-[1px] bg-white/10 flex-1"></span>
                  </div>
                  
                  {/* Google Identity Services Button Container */}
                  <div className="flex justify-center">
                    <div 
                      id="google-signin-btn" 
                      className="backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-white/5 transform hover:scale-[1.01] transition-transform duration-200"
                    ></div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-white/40 font-medium">
              New to the platform?{" "}
              <Link href="/register" className="font-bold text-purple-400 hover:text-purple-300 transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-white/30 tracking-wider">
          &copy; 2025 Teamzen Pvt. Ltd. All rights reserved.
        </p>
      </div>
      
      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-sm glass-login p-8 rounded-[32px] border border-white/10">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center animate-pulse">
                <Globe className="w-8 h-8 text-purple-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Location Sync Required</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  To ensure workplace check-in compliance and secure session logging, we need location coordinates.
                  Please allow access in your browser settings.
                </p>
              </div>
              {locationError && (
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-center">
                  <p className="text-[11px] text-red-400 font-medium">{locationError}</p>
                </div>
              )}
              <div className="space-y-2.5">
                <Button
                  onClick={() => requestLocation()}
                  disabled={isLocating}
                  className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all"
                >
                  {isLocating ? <Loader2 className="animate-spin w-5 h-5 text-white" /> : "TRY AGAIN"}
                </Button>
                <button
                  onClick={() => {
                    setShowLocationModal(false);
                    if (authType === "password") {
                      performLogin();
                    }
                  }}
                  className="w-full py-1.5 text-xs text-white/40 hover:text-white transition-colors"
                >
                  Skip & Authenticate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
