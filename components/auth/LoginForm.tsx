"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/api/hooks";
import { useStore } from "@/lib/store/useStore";
import { BrandImages } from "@/lib/brand-images";
import {
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { GoogleMark } from "./auth-ui";
import ConfirmationModal from "../common/ConfirmationModal";

function markLocationSyncNeeded() {
  try {
    sessionStorage.setItem("teamzen_sync_location", "1");
  } catch {
    /* ignore */
  }
}

function postLoginPath(user: any): string {
  const active = user?.isActive ?? user?.is_active;
  return active === false ? "/exit" : "/dashboard";
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authType, setAuthType] = useState<"password" | "otp">("password");
  const [step, setStep] = useState<"login" | "otp_code" | "totp">("login");
  const [otpCode, setOtpCode] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const rememberMeRef = useRef(false);
  rememberMeRef.current = rememberMe;

  const isRedirectingRef = useRef(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  const showError = (message: string) => setErrorModal({ isOpen: true, message });

  const { login, requestOtp, verifyOtp, verifyTotp, googleLogin } = useAuth();
  const { loginUser, logoutUser, isAuthenticated, hasHydrated } = useStore();

  useEffect(() => {
    if (step !== "login") return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      try {
        const google = (window as any).google;
        const btn = document.getElementById("google-signin-btn");
        if (google && btn) {
          google.accounts.id.initialize({
            client_id:
              process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
              "1016839352936-google-placeholder.apps.googleusercontent.com",
            callback: handleGoogleCredentialResponse,
          });
          google.accounts.id.renderButton(btn, {
            theme: "outline",
            size: "large",
            width: 240,
            text: "signin_with",
            shape: "pill",
          });
        }
      } catch (err) {
        console.warn("Google sign-in button init note:", err);
      }
    };

    return () => {
      try {
        document.body.removeChild(script);
      } catch {
        /* ignore */
      }
    };
  }, [step, authType]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Sync auth state from session cookies on mount
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || isRedirectingRef.current) return;

    let cancelled = false;
    (async () => {
      try {
        const sessionRes = await fetch("/api/auth/session", {
          credentials: "include",
        });
        const session = await sessionRes.json().catch(() => ({}));
        if (cancelled || isRedirectingRef.current) return;

        if (!session?.authenticated) {
          logoutUser();
        }
      } catch {
        if (!cancelled && !isRedirectingRef.current) logoutUser();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, isAuthenticated, logoutUser]);

  const goAfterLogin = (user: any) => {
    isRedirectingRef.current = true;
    setIsRedirecting(true);
    loginUser(user);
    if ((user?.isActive ?? user?.is_active) !== false) {
      markLocationSyncNeeded();
    }
    const dest = postLoginPath(user);
    window.location.replace(dest);
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    const idToken = response.credential;
    try {
      const loginResult = await googleLogin.mutateAsync({
        id_token: idToken,
        remember_me: rememberMeRef.current,
      });

      if (loginResult.totp_required) {
        setTempToken(loginResult.temp_token);
        setStep("totp");
      } else if (loginResult.user) {
        goAfterLogin(loginResult.user);
      }
    } catch (err: any) {
      showError(err.message || "Google sign-in failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authType === "otp") {
      if (step === "login") {
        try {
          await requestOtp.mutateAsync(email);
          setStep("otp_code");
          setCountdown(60);
        } catch (error: any) {
          showError(error.message || "Failed to send verification code");
        }
      } else if (step === "otp_code") {
        try {
          const result = await verifyOtp.mutateAsync({
            email,
            otp: otpCode,
            remember_me: rememberMe,
          });

          if (result.totp_required) {
            setTempToken(result.temp_token);
            setStep("totp");
          } else if (result.user) {
            goAfterLogin(result.user);
          }
        } catch (error: any) {
          showError(error.message || "Invalid OTP code");
        }
      }
    } else {
      await performLogin();
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      await requestOtp.mutateAsync(email);
      setCountdown(60);
    } catch (error: any) {
      showError(error.message || "Failed to send code");
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode) return;
    try {
      const result = await verifyTotp.mutateAsync({
        temp_token: tempToken,
        code: totpCode,
        remember_me: rememberMe,
      });
      if (result.user) {
        goAfterLogin(result.user);
      }
    } catch (error: any) {
      showError(error.message || "Invalid authenticator code");
    }
  };

  const performLogin = async () => {
    try {
      const response = await login.mutateAsync({
        email,
        password,
        remember_me: rememberMe,
      });

      if (response && response.totp_required) {
        setTempToken(response.temp_token);
        setStep("totp");
        return;
      }

      if (response && response.user) {
        goAfterLogin(response.user);
      }
    } catch (error: any) {
      showError(error.message || "Login failed");
    }
  };

  const isPending =
    isRedirecting ||
    login.isPending ||
    verifyOtp.isPending ||
    requestOtp.isPending ||
    verifyTotp.isPending;

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 font-sans selection:bg-[#38ABB1]/30 selection:text-[#38ABB1] overflow-hidden"
      style={{
        backgroundColor: "#03090a",
        backgroundImage:
          "radial-gradient(ellipse 90% 65% at 50% -15%, rgba(56, 171, 177, 0.35), transparent 70%), radial-gradient(ellipse 60% 50% at 100% 40%, rgba(56, 171, 177, 0.2), transparent 65%), radial-gradient(ellipse 55% 45% at 0% 70%, rgba(43, 138, 143, 0.18), transparent 60%)",
      }}
    >
      {/* Subtle landing grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          maskImage: "linear-gradient(180deg, black 0%, transparent 85%)",
          WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 85%)",
          backgroundImage:
            "linear-gradient(to right, rgba(56, 171, 177, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 171, 177, 0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      {/* Centered Floating Card Matching Landing Page Black & Teal Palette */}
      <div
        className="relative z-10 w-full max-w-[960px] min-h-[520px] md:min-h-[560px] rounded-3xl overflow-hidden flex flex-col md:flex-row"
        style={{
          backgroundColor: "#061315",
          border: "1px solid rgba(56, 171, 177, 0.28)",
          boxShadow:
            "0 25px 70px -15px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(56, 171, 177, 0.22), 0 0 45px -10px rgba(56, 171, 177, 0.18)",
        }}
      >
        {/* Mobile Header Banner (Visible on < md screens) */}
        <div className="relative w-full h-44 overflow-hidden md:hidden">
          <Image
            src="/images/auth/login-geometric-teal.webp"
            alt="Welcome pattern"
            fill
            priority
            sizes="100vw"
            className="object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-[#061315]/60 to-transparent" />
          <div className="relative z-10 p-6 flex flex-col justify-end h-full text-white">
            <h2 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">
              {step === "totp" ? "Security Check" : "Welcome Back."}
            </h2>
            <p className="text-xs text-white/85 line-clamp-2 mt-1">
              Sign in to access your attendance, leaves, and payroll.
            </p>
          </div>
        </div>

        {/* Left Section: Login Form */}
        <div className="relative z-20 w-full md:w-[48%] lg:w-[45%] p-7 sm:p-9 md:p-10 lg:p-12 flex flex-col justify-center">
          
          {/* Prominent Teamzen Brand Header */}
          <div className="mb-6 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-[#38ABB1]/40 p-1.5 transition-transform group-hover:scale-105">
                <Image
                  src={BrandImages.mark}
                  alt="Teamzen logo"
                  width={36}
                  height={36}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white leading-tight group-hover:text-[#38ABB1] transition-colors">
                  Teamzen
                </span>
                <span className="text-[11px] font-medium text-[#38ABB1]/90">
                  Workforce Portal
                </span>
              </div>
            </Link>

            {step === "login" && (
              <button
                type="button"
                onClick={() => setAuthType(authType === "password" ? "otp" : "password")}
                className="text-xs font-semibold text-[#38ABB1] hover:text-[#58d2d8] hover:underline transition-colors cursor-pointer"
              >
                {authType === "password" ? "Use OTP Login" : "Use Password"}
              </button>
            )}
          </div>

          {/* Form Titles */}
          <div className="mb-6 space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {step === "totp" ? "Security code" : "Login"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              {step === "totp" ? (
                "Enter code from your authenticator app"
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-[#38ABB1] hover:text-[#58d2d8] hover:underline transition-colors"
                  >
                    Create your account
                  </Link>
                </>
              )}
            </p>
          </div>

          {/* Step: TOTP Verification */}
          {step === "totp" ? (
            <form onSubmit={handleVerifyTotp} className="space-y-4">
              <div
                className="flex items-start gap-2.5 rounded-lg p-3"
                style={{
                  backgroundColor: "rgba(56, 171, 177, 0.12)",
                  border: "1px solid rgba(56, 171, 177, 0.35)",
                }}
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#38ABB1]" />
                <p className="text-xs text-zinc-300">
                  Open your authenticator app and enter the 6-digit code for Teamzen.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300" htmlFor="totp-code">
                  6-Digit Authenticator Code
                </label>
                <div className="relative">
                  <input
                    id="totp-code"
                    name="code"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full h-11 px-4 text-center font-mono text-base tracking-widest rounded-lg text-white placeholder:text-[#589ea3] focus:outline-none focus:border-[#38ABB1] focus:ring-2 focus:ring-[#38ABB1]/30 transition-all shadow-sm"
                    style={{
                      backgroundColor: "#07181a",
                      border: "1px solid #164649",
                    }}
                  />
                  <KeyRound className="absolute right-3.5 top-3.5 h-4 w-4 text-[#38ABB1] pointer-events-none" />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isPending || totpCode.length < 6}
                  className="h-10 px-8 rounded-full bg-gradient-to-r from-[#38ABB1] via-[#339fa5] to-[#267c82] hover:from-[#42bec4] hover:to-[#2c8d93] active:scale-[0.99] text-white font-bold text-xs tracking-wider uppercase shadow-md shadow-[#38ABB1]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isRedirecting ? "REDIRECTING…" : "VERIFY & LOGIN"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("login");
                    setOtpCode("");
                  }}
                  className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Back
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === "login" ? (
                <>
                  {/* Username / Email field */}
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        id="username-email"
                        name="email"
                        type="text"
                        required
                        autoComplete="username"
                        placeholder={authType === "otp" ? "Work email address" : "Username"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg text-sm text-white placeholder:text-[#589ea3] focus:outline-none focus:border-[#38ABB1] focus:ring-2 focus:ring-[#38ABB1]/30 transition-all shadow-sm"
                        style={{
                          backgroundColor: "#07181a",
                          border: "1px solid #164649",
                        }}
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  {authType === "password" && (
                    <div className="space-y-1">
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          autoComplete="current-password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full h-11 pl-4 pr-11 rounded-lg text-sm text-white placeholder:text-[#589ea3] focus:outline-none focus:border-[#38ABB1] focus:ring-2 focus:ring-[#38ABB1]/30 transition-all shadow-sm"
                          style={{
                            backgroundColor: "#07181a",
                            border: "1px solid #164649",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-zinc-400" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Options row: Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#38ABB1] cursor-pointer"
                        style={{
                          backgroundColor: "#07181a",
                          borderColor: "#164649",
                        }}
                      />
                      <span className="text-zinc-300">Remember Me</span>
                    </label>

                    {authType === "password" && (
                      <Link
                        href="/forgot-password"
                        prefetch={false}
                        className="text-xs text-zinc-400 hover:text-[#38ABB1] transition-colors"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                /* Step: OTP Code verification */
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-400">
                      Code sent to <span className="font-semibold text-white">{email}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("login");
                        setOtpCode("");
                      }}
                      className="text-xs text-[#38ABB1] hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-1">
                    <input
                      id="otp-code"
                      name="otp"
                      type="text"
                      required
                      maxLength={6}
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full h-11 px-4 text-center font-mono text-base tracking-widest rounded-lg text-white placeholder:text-[#589ea3] focus:outline-none focus:border-[#38ABB1] focus:ring-2 focus:ring-[#38ABB1]/30 transition-all shadow-sm"
                      style={{
                        backgroundColor: "#07181a",
                        border: "1px solid #164649",
                      }}
                    />
                  </div>

                  <div className="text-xs text-zinc-400">
                    {countdown > 0 ? (
                      <span>Resend code in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="font-medium text-[#38ABB1] hover:underline cursor-pointer"
                      >
                        Resend code
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button: Pill shape in Teamzen Teal #38ABB1 & Black palette */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="h-10 px-9 rounded-full bg-gradient-to-r from-[#38ABB1] via-[#339fa5] to-[#267c82] hover:from-[#42bec4] hover:to-[#2c8d93] active:scale-[0.99] text-white font-bold text-xs tracking-wider uppercase shadow-md shadow-[#38ABB1]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isRedirecting
                    ? "REDIRECTING…"
                    : login.isPending || requestOtp.isPending || verifyOtp.isPending
                    ? "SIGNING IN…"
                    : authType === "otp"
                    ? step === "login"
                      ? "SEND CODE"
                      : "VERIFY & LOGIN"
                    : "LOGIN"}
                </button>
              </div>

              {/* Social / Alternate Login Row */}
              {step === "login" && (
                <div className="mt-8 pt-2 flex items-center gap-3">
                  <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                    Or login with
                  </span>

                  {/* Google SSO Button */}
                  <div className="relative group cursor-pointer">
                    <div
                      className="h-7 px-2.5 rounded-md flex items-center gap-1.5 shadow-sm transition-colors"
                      style={{
                        backgroundColor: "#07181a",
                        border: "1px solid #164649",
                      }}
                    >
                      <GoogleMark />
                      <span className="text-[11px] font-semibold text-zinc-200">
                        Google
                      </span>
                    </div>
                    {/* Google GSI hidden overlay target */}
                    <div
                      id="google-signin-btn"
                      className="absolute inset-0 opacity-[0.01] overflow-hidden rounded-md cursor-pointer z-10"
                      title="Sign in with Google"
                    />
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Right Section: Low-Poly Diagonal Polygonal Panel (Desktop) in Landing Page Teal */}
        <div
          className="hidden md:block absolute inset-0 pointer-events-none select-none overflow-hidden rounded-3xl"
          style={{ clipPath: "polygon(34% 0%, 100% 0%, 100% 100%, 90% 100%)" }}
        >
          <Image
            src="/images/auth/login-geometric-teal.webp"
            alt="Geometric teal crystal pattern"
            fill
            priority
            sizes="65vw"
            className="object-cover object-right"
          />
          {/* Subtle gradient overlay to guarantee text contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#061315]/40 via-transparent to-[#03090a]/65" />

          {/* Welcome Text Content: Positioned in top-right with text-right, staying completely away from the diagonal split */}
          <div className="absolute top-12 lg:top-16 right-8 lg:right-14 z-10 flex flex-col items-end text-right max-w-[280px] lg:max-w-[320px]">
            <h2 className="text-4xl lg:text-[48px] font-extrabold tracking-tight text-white drop-shadow-lg leading-[1.08]">
              Welcome
              <br />
              Back.
            </h2>
            <p className="mt-4 text-xs lg:text-sm text-white/90 leading-relaxed font-normal max-w-[260px] lg:max-w-[290px] drop-shadow-md">
              {step === "totp"
                ? "Enter the code from your authenticator app to verify your identity and protect your account."
                : "Sign in to access your workforce portal, track attendance, manage leaves, and view payroll seamlessly."}
            </p>
          </div>
        </div>

      </div>

      {/* Confirmation / Error Modal */}
      <ConfirmationModal
        isOpen={errorModal.isOpen}
        title="Authentication Error"
        description={errorModal.message || "Please try again or contact support if the issue persists."}
        onClose={() => setErrorModal({ isOpen: false, message: "" })}
        onConfirm={() => setErrorModal({ isOpen: false, message: "" })}
        confirmText="Close"
        variant="error"
        hideCancel={true}
      />
    </div>
  );
}
