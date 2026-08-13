"use client";

import { useState, Suspense } from "react";
import { Lock, Loader2, CheckCircle2, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import axios from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { toast } from "sonner";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthImages } from "@/lib/brand-images";
import { AUTH_INPUT_CLASS, AuthSubmitButton } from "@/components/auth/auth-ui";

function ResetPasswordFormInner() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!uid || !token) {
      toast.error("Invalid reset link");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(API_ENDPOINTS.PASSWORD_RESET_CONFIRM, {
        uid,
        token,
        password,
      });
      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (error: any) {
      toast.error("Reset failed", {
        description:
          error.response?.data?.error ||
          "Invalid or expired reset link. Please try requesting a new one.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!uid || !token) {
    return (
      <AuthShell
        title="Invalid link"
        description="This password reset link is invalid or has expired."
        sideImage={AuthImages.security}
        sideImageAlt="Password reset security illustration"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Request a new reset link and try again.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Request a new link
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset password"
      description={
        isSuccess
          ? "Your password has been updated."
          : "Choose a new password for your account."
      }
      sideImage={AuthImages.security}
      sideImageAlt="Password reset security illustration"
    >
      {!isSuccess ? (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                New password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  icon={<Lock className="h-4 w-4" />}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${AUTH_INPUT_CLASS} pr-10`}
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="confirm-password">
                Confirm password
              </label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type={showPassword ? "text" : "password"}
                required
                icon={<Lock className="h-4 w-4" />}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={AUTH_INPUT_CLASS}
              />
            </div>
          </div>

            <AuthSubmitButton type="submit" disabled={isLoading} loading={isLoading}>
              {isLoading ? "Updating…" : "Reset password"}
            </AuthSubmitButton>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-sm text-muted-foreground">
              Your password has been updated. You can now sign in.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign in
          </Link>
        </div>
      )}
    </AuthShell>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Reset password"
          description="Loading…"
          sideImage={AuthImages.security}
          sideImageAlt="Password reset security illustration"
        >
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </AuthShell>
      }
    >
      <ResetPasswordFormInner />
    </Suspense>
  );
}
