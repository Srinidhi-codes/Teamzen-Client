"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/api/hooks";
import { useStore } from "@/lib/store/useStore";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { AuthShell } from "./AuthShell";
import { cn } from "@/lib/utils";
import { AuthImages } from "@/lib/brand-images";
import {
  AUTH_INPUT_CLASS,
  AuthDivider,
  AuthFooterLink,
  AuthSubmitButton,
  GoogleMark,
  AppleIcon,
  FacebookIcon,
} from "./auth-ui";
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
            width: 400,
            text: "signin_with",
            shape: "rectangular",
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

  // Only sync auth state from session cookies on mount.
  // If cookies are gone, clear stale localStorage (logoutUser).
  // Never trigger automatic redirects on mount to prevent /login <-> /dashboard bounce loops.
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

  const submitLabel = () => {
    if (isRedirecting) {
      return "Redirecting…";
    }
    if (login.isPending || verifyOtp.isPending || requestOtp.isPending || verifyTotp.isPending) {
      return "Signing in…";
    }
    if (authType === "otp") return step === "login" ? "Send code" : "Verify and sign in";
    return "Sign in";
  };

  return (
    <>
    <AuthShell
      title={step === "totp" ? "Two-Factor Authentication" : "Login to Your Account"}
      description={
        step === "totp"
          ? "Enter the 6-digit code from your authenticator app."
          : undefined
      }
      sideImage={AuthImages.dashboard}
      sideImageAlt="Teamzen workforce analytics and payroll dashboard"
    >
      {step === "totp" ? (
        <form onSubmit={handleVerifyTotp} className="space-y-5">
          <div className="flex items-start gap-3 rounded-2xl border border-[#38ABB1]/20 bg-[#38ABB1]/5 p-4 backdrop-blur-sm">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#38ABB1] dark:text-[#4cd1d7]" />
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Open your authenticator app and enter the active 6-digit verification code for your Teamzen account.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground/90 block" htmlFor="totp-code">
              Security Code <span className="text-red-500">*</span>
            </label>
            <input
              id="totp-code"
              name="code"
              type="text"
              required
              maxLength={6}
              placeholder="000000"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
              className="w-full h-12 rounded-xl sm:rounded-2xl bg-[#f0f2f5] dark:bg-slate-800/80 border-2 border-transparent focus:border-[#38ABB1] dark:focus:border-[#38ABB1] focus:bg-white dark:focus:bg-slate-900 text-center font-mono text-lg tracking-widest text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={isRedirecting || verifyTotp.isPending}
            className="w-full h-12 rounded-xl sm:rounded-2xl bg-[#101726] hover:bg-[#1c273c] text-white dark:bg-[#38ABB1] dark:hover:bg-[#2e949a] dark:text-slate-950 font-bold text-sm sm:text-base shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isRedirecting ? "Redirecting…" : verifyTotp.isPending ? "Verifying…" : "Verify and Sign In"}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("login");
              setTotpCode("");
            }}
            className="w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 cursor-pointer"
          >
            ← Back to sign in
          </button>
        </form>
      ) : (
        <>
          {/* Main Login Form matching reference UI */}
          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            {step === "login" ? (
              <div className="space-y-4 sm:space-y-5">
                {/* Field 1: Email, Username or User ID */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-foreground/90 block" htmlFor="email-address">
                    Email or Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="text"
                    required
                    placeholder="Enter your email or username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-[#f0f2f5] dark:bg-slate-800/80 border-2 border-transparent focus:border-[#38ABB1] dark:focus:border-[#38ABB1] focus:bg-white dark:focus:bg-slate-900 px-4 sm:px-5 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-200 shadow-xs"
                  />
                </div>

                {/* Field 2: Password or OTP notification */}
                {authType === "password" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-semibold text-foreground/90 block" htmlFor="password">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setAuthType("otp")}
                        className="text-xs font-semibold text-[#38ABB1] dark:text-[#4cd1d7] hover:underline cursor-pointer"
                      >
                        Sign in with OTP
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-[#f0f2f5] dark:bg-slate-800/80 border-2 border-transparent focus:border-[#38ABB1] dark:focus:border-[#38ABB1] focus:bg-white dark:focus:bg-slate-900 px-4 sm:px-5 pr-12 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-200 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#38ABB1]/30 bg-[#38ABB1]/5 p-4 text-xs sm:text-sm text-muted-foreground flex items-center justify-between">
                    <span>Signing in via One-Time Passcode (OTP).</span>
                    <button
                      type="button"
                      onClick={() => setAuthType("password")}
                      className="font-semibold text-[#38ABB1] hover:underline cursor-pointer"
                    >
                      Use Password
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#38ABB1]/20 bg-[#38ABB1]/5 p-4 text-xs sm:text-sm text-muted-foreground">
                  We sent a 6-digit one-time passcode to{" "}
                  <span className="font-semibold text-foreground">{email}</span>
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-foreground/90 block" htmlFor="otp-code">
                    Verification Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="otp-code"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-[#f0f2f5] dark:bg-slate-800/80 border-2 border-transparent focus:border-[#38ABB1] dark:focus:border-[#38ABB1] focus:bg-white dark:focus:bg-slate-900 text-center font-mono text-xl tracking-widest text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-200"
                  />
                </div>
                <div className="text-center text-xs sm:text-sm">
                  {countdown > 0 ? (
                    <span className="text-muted-foreground">Resend code in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-semibold text-[#38ABB1] dark:text-[#4cd1d7] hover:underline cursor-pointer"
                    >
                      Resend new code
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Checkbox and Forgot Password Row */}
            {step === "login" && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2.5 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-[#38ABB1] focus:ring-[#38ABB1] accent-[#38ABB1] cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-medium text-foreground/80">
                    Remember me on this device
                  </span>
                </label>
                {authType === "password" && (
                  <Link
                    href="/forgot-password"
                    prefetch={false}
                    className="text-xs sm:text-sm font-semibold text-[#38ABB1] dark:text-[#4cd1d7] hover:underline transition-colors"
                  >
                    Forgot Your Password?
                  </Link>
                )}
              </div>
            )}

            {/* Primary Action Button: Log in */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isRedirecting || login.isPending || requestOtp.isPending || verifyOtp.isPending}
                className="w-full h-13 sm:h-14 rounded-xl sm:rounded-2xl bg-[#38ABB1] hover:bg-[#2e949a] text-white shadow-lg shadow-[#38ABB1]/30 dark:bg-[#38ABB1] dark:hover:bg-[#2e949a] dark:text-slate-950 font-bold text-base sm:text-lg transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitLabel() === "Sign in" ? "Log in" : submitLabel()}
              </button>
            </div>

            {step === "otp_code" && (
              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setOtpCode("");
                }}
                className="w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors pt-1 cursor-pointer"
              >
                ← Use different email
              </button>
            )}
          </form>

          {/* Sign up prompt */}
          {step === "login" && (
            <div className="mt-4 sm:mt-5 text-center">
              <p className="text-xs sm:text-sm text-foreground/80 font-medium">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#38ABB1] dark:text-[#4cd1d7] hover:underline ml-1"
                >
                  Create an account
                </Link>
              </p>
            </div>
          )}

          {/* Or login with Divider */}
          {step === "login" && (
            <div className="mt-6 sm:mt-7 space-y-4">
              <div className="relative flex items-center justify-center text-xs text-muted-foreground">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative bg-white dark:bg-[#0d1622] px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                  Or continue with
                </span>
              </div>

              {/* Social / SSO Buttons */}
              <div className="flex items-center justify-center gap-3.5 py-1">
                {/* Google Button */}
                <div
                  className="relative h-12 w-12 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 flex items-center justify-center shadow-xs hover:border-[#38ABB1] hover:scale-105 transition-all cursor-pointer group overflow-hidden"
                  title="Sign in with Google"
                >
                  <GoogleMark />
                  <div
                    id="google-signin-btn"
                    className="absolute inset-0 z-10 opacity-[0.01] cursor-pointer overflow-hidden scale-150"
                  />
                </div>

                {/* Apple SSO Button */}
                <button
                  type="button"
                  onClick={() => showError("Apple SSO is configured for enterprise domains. Please use email or Google.")}
                  className="h-12 w-12 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 flex items-center justify-center shadow-xs hover:border-[#38ABB1] hover:scale-105 transition-all cursor-pointer text-foreground"
                  title="Sign in with Apple"
                >
                  <AppleIcon className="h-5 w-5" />
                </button>

                {/* Enterprise SSO / Key Button */}
                <button
                  type="button"
                  onClick={() => showError("Enterprise SAML / SSO portal available on Pro and Elite plans.")}
                  className="h-12 w-12 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 flex items-center justify-center shadow-xs hover:border-[#38ABB1] hover:scale-105 transition-all cursor-pointer text-muted-foreground hover:text-[#38ABB1]"
                  title="Enterprise SSO"
                >
                  <KeyRound className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Legal and Copyright Footer */}
          <div className="mt-8 pt-5 text-center space-y-1.5 text-xs text-muted-foreground border-t border-slate-100 dark:border-slate-800/80">
            <p className="leading-relaxed">
              By continuing you agree to our{" "}
              <Link href="/terms" className="text-[#38ABB1] hover:underline font-medium">Terms &amp; Conditions</Link>,{" "}
              <Link href="/privacy" className="text-[#38ABB1] hover:underline font-medium">Privacy Policy</Link>, and{" "}
              <Link href="/cookies" className="text-[#38ABB1] hover:underline font-medium">Cookies Policy</Link>.
            </p>
            <p className="text-[11px] text-muted-foreground/70">
              © {new Date().getFullYear()} Teamzen. All rights reserved.
            </p>
          </div>
        </>
      )}
    </AuthShell>

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
    </>
  );
}
