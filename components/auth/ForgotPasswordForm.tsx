"use client";

import { useState } from "react";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import axios from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthImages } from "@/lib/brand-images";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(API_ENDPOINTS.PASSWORD_RESET_REQUEST, { email });
      setIsSent(true);
      toast.success("Reset link sent!", {
        description: "Please check your inbox for instructions.",
      });
    } catch (error: any) {
      toast.error("Request failed", {
        description:
          error.response?.data?.error ||
          "We couldn't process your request. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot password"
      description={
        isSent ? "We've sent a reset link to your email." : "We'll email you a reset link."
      }
      sideImage={AuthImages.security}
      sideImageAlt="Password reset security illustration"
    >
      {!isSent ? (
        <form className="space-y-5" onSubmit={handleSubmit}>
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

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Sending…" : "Send reset link"}
          </button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </form>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or try again in a few minutes.
          </p>
          <button
            type="button"
            onClick={() => setIsSent(false)}
            className="inline-flex h-10 w-full items-center justify-center rounded-md border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Try a different email
          </button>
          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
