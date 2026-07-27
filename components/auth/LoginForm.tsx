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
  Loader2,
  MapPin,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { Input } from "../ui/input";
import { AuthShell } from "./AuthShell";
import { cn } from "@/lib/utils";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [authType, setAuthType] = useState<"password" | "otp">("password");
  const [step, setStep] = useState<"login" | "otp_code" | "totp">("login");
  const [otpCode, setOtpCode] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [countdown, setCountdown] = useState(0);

  const { login, requestOtp, verifyOtp, verifyTotp, googleLogin } = useAuth();
  const { loginUser, isAuthenticated, hasHydrated } = useStore();
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
          width: 360,
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

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, router]);

  const requestLocation = async (): Promise<{
    latitude: number;
    longitude: number;
  } | null> => {
    setIsLocating(true);
    setLocationError("");

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          setShowLocationModal(false);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setIsLocating(false);
          if (err.code === 1) {
            setLocationError(
              "Location is blocked. Allow location access in your browser settings, then try again."
            );
          } else {
            setLocationError("We couldn't get your location. Please try again.");
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
        longitude: coords?.longitude,
      });

      if (loginResult.totp_required) {
        setTempToken(loginResult.temp_token);
        setStep("totp");
      } else if (loginResult.user) {
        loginUser(loginResult.user);
        window.location.href = "/dashboard";
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
        const coords = await requestLocation();
        try {
          const result = await verifyOtp.mutateAsync({
            email,
            otp: otpCode,
            latitude: coords?.latitude,
            longitude: coords?.longitude,
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
        longitude: coords?.longitude,
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
        longitude: lon ? parseFloat(lon.toFixed(10)) : undefined,
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

  const submitLabel = () => {
    if (isLocating) return "Getting location…";
    if (login.isPending || verifyOtp.isPending || requestOtp.isPending) return "Please wait…";
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
              className="text-center font-mono tracking-widest"
            />
          </div>

          <button
            type="submit"
            disabled={verifyTotp.isPending || isLocating}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {(verifyTotp.isPending || isLocating) && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify and sign in
          </button>

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
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-md border border-border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => setAuthType("password")}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  authType === "password"
                    ? "bg-background font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => setAuthType("otp")}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  authType === "otp"
                    ? "bg-background font-medium text-foreground shadow-sm"
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
                    className="text-center font-mono tracking-widest"
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

            <button
              type="submit"
              disabled={
                login.isPending ||
                requestOtp.isPending ||
                verifyOtp.isPending ||
                isLocating
              }
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {(login.isPending ||
                requestOtp.isPending ||
                verifyOtp.isPending ||
                isLocating) && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitLabel()}
            </button>

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
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                Or continue with
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="flex justify-center">
                <div id="google-signin-btn" />
              </div>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </>
      )}

      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">Allow location</h3>
                  <p className="text-sm text-muted-foreground">
                    Location helps verify check-ins and secure session logging. You can skip if needed.
                  </p>
                </div>
              </div>

              {locationError && (
                <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {locationError}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => requestLocation()}
                  disabled={isLocating}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {isLocating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Allow location
                </button>
                <button
                  onClick={() => {
                    setShowLocationModal(false);
                    if (authType === "password") {
                      performLogin();
                    }
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Skip and sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
