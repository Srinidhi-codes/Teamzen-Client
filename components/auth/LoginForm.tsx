"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/api/hooks";
import { useStore } from "@/lib/store/useStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
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
} from "./auth-ui";

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

  const { login, requestOtp, verifyOtp, verifyTotp, googleLogin } = useAuth();
  const { loginUser, logoutUser, isAuthenticated, hasHydrated } = useStore();
  const router = useRouter();

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
          client_id:
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
            "1016839352936-google-placeholder.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        google.accounts.id.renderButton(document.getElementById("google-signin-btn"), {
          theme: "outline",
          size: "large",
          width: 400,
          text: "signin_with",
          shape: "rectangular",
        });
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

  // Only send logged-in users to the app if cookies are still valid.
  // Stale localStorage alone used to bounce: /login → /dashboard → /login.
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;

    let cancelled = false;
    (async () => {
      try {
        const sessionRes = await fetch("/api/auth/session", {
          credentials: "include",
        });
        const session = await sessionRes.json().catch(() => ({}));
        if (cancelled) return;

        if (!session?.authenticated) {
          logoutUser();
          return;
        }

        if (!session.hasAccess && session.hasRefresh) {
          const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          });
          if (cancelled) return;
          if (!refreshRes.ok) {
            logoutUser();
            return;
          }
        }

        router.replace("/dashboard");
      } catch {
        if (!cancelled) logoutUser();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, isAuthenticated, router, logoutUser]);

  const goAfterLogin = (user: any) => {
    loginUser(user);
    if ((user?.isActive ?? user?.is_active) !== false) {
      markLocationSyncNeeded();
    }
    router.replace(postLoginPath(user));
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    const idToken = response.credential;
    try {
      const loginResult = await googleLogin.mutateAsync({
        id_token: idToken,
      });

      if (loginResult.totp_required) {
        setTempToken(loginResult.temp_token);
        setStep("totp");
      } else if (loginResult.user) {
        goAfterLogin(loginResult.user);
      }
    } catch (err: any) {
      alert(err.message || "Google sign-in failed");
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
          alert(error.message || "Failed to send verification code");
        }
      } else if (step === "otp_code") {
        try {
          const result = await verifyOtp.mutateAsync({
            email,
            otp: otpCode,
          });

          if (result.totp_required) {
            setTempToken(result.temp_token);
            setStep("totp");
          } else if (result.user) {
            goAfterLogin(result.user);
          }
        } catch (error: any) {
          alert(error.message || "Invalid OTP code");
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
      alert(error.message || "Failed to send code");
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode) return;
    try {
      const result = await verifyTotp.mutateAsync({
        temp_token: tempToken,
        code: totpCode,
      });
      if (result.user) {
        goAfterLogin(result.user);
      }
    } catch (error: any) {
      alert(error.message || "Invalid authenticator code");
    }
  };

  const performLogin = async () => {
    try {
      const response = await login.mutateAsync({
        email,
        password,
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
      alert(error.message || "Login failed");
    }
  };

  const submitLabel = () => {
    if (login.isPending || verifyOtp.isPending || requestOtp.isPending || verifyTotp.isPending) {
      return "Signing in…";
    }
    if (authType === "otp") return step === "login" ? "Send code" : "Verify and sign in";
    return "Sign in";
  };

  return (
    <AuthShell
      title={step === "totp" ? "Two-factor authentication" : "Sign in"}
      description={
        step === "totp"
          ? "Enter the 6-digit code from your authenticator app."
          : "Use your work email to continue."
      }
      sideImage={step === "totp" ? AuthImages.security : AuthImages.employee}
      sideImageAlt={
        step === "totp"
          ? "Secure authentication illustration"
          : "Teamzen employee workspace illustration"
      }
    >
      {step === "totp" ? (
        <form onSubmit={handleVerifyTotp} className="space-y-5">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              Open your authenticator app and enter the current code for Teamzen.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="totp-code">
              Security code
            </label>
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
              className={cn(AUTH_INPUT_CLASS, "text-center font-mono tracking-widest")}
            />
          </div>

          <AuthSubmitButton type="submit" disabled={verifyTotp.isPending} loading={verifyTotp.isPending}>
            Verify and sign in
          </AuthSubmitButton>

          <button
            type="button"
            onClick={() => {
              setStep("login");
              setTotpCode("");
            }}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Back to sign in
          </button>
        </form>
      ) : (
        <>
          {step === "login" && (
            <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => setAuthType("password")}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm transition-colors",
                  authType === "password"
                    ? "bg-card font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => setAuthType("otp")}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm transition-colors",
                  authType === "otp"
                    ? "bg-card font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Email OTP
              </button>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {step === "login" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="email-address">
                    Email
                  </label>
                  <Input
                    id="email-address"
                    name="email"
                    type="email"
                    required
                    icon={<Mail className="h-4 w-4" />}
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={AUTH_INPUT_CLASS}
                  />
                </div>

                {authType === "password" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-sm font-medium text-foreground" htmlFor="password">
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        prefetch={false}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        icon={<Lock className="h-4 w-4" />}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={cn(AUTH_INPUT_CLASS, "pr-10")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="otp-code">
                    Verification code
                  </label>
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
                    className={cn(AUTH_INPUT_CLASS, "text-center font-mono tracking-widest")}
                  />
                </div>
                <div className="text-center text-sm">
                  {countdown > 0 ? (
                    <span className="text-muted-foreground">Resend code in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-medium text-primary hover:underline"
                    >
                      Resend code
                    </button>
                  )}
                </div>
              </div>
            )}

            <AuthSubmitButton
              type="submit"
              disabled={
                login.isPending ||
                requestOtp.isPending ||
                verifyOtp.isPending
              }
              loading={
                login.isPending ||
                requestOtp.isPending ||
                verifyOtp.isPending
              }
            >
              {submitLabel()}
            </AuthSubmitButton>

            {step === "otp_code" && (
              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setOtpCode("");
                }}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Change email
              </button>
            )}
          </form>

          {step === "login" && (
            <div className="mt-6 space-y-4">
              <AuthDivider />
              <div className="relative h-11 w-full overflow-hidden rounded-lg border border-border bg-white">
                <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center gap-2.5 text-sm font-medium text-slate-800">
                  <GoogleMark />
                  Sign in with Google
                </div>
                <div
                  id="google-signin-btn"
                  className="absolute inset-0 z-10 flex items-center justify-center opacity-[0.02]"
                />
              </div>
            </div>
          )}

          <AuthFooterLink prompt="New here?" href="/register" label="Create an account" />
        </>
      )}
    </AuthShell>
  );
}
