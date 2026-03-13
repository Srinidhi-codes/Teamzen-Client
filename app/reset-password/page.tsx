"use client";

import { useState, Suspense } from "react";
import { Lock, Loader2, CheckCircle2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { toast } from "sonner";
import Link from "next/link";

import { PublicNavbar } from "@/components/common/PublicNavbar";

function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const router = useRouter();
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
                password
            });
            setIsSuccess(true);
            toast.success("Password reset successfully!");
        } catch (error: any) {
            toast.error("Reset failed", {
                description: error.response?.data?.error || "Invalid or expired reset link. Please try requesting a new one.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!uid || !token) {
        return (
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-destructive">Invalid Link</h2>
                <p className="text-muted-foreground">This password reset link is invalid or has expired.</p>
                <Link href="/forgot-password">
                    <Button variant="link" className="text-primary font-bold">Request a new link</Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="animate-fade-in text-center">
                <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Set New Password</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    {isSuccess
                        ? "Your password has been updated successfully."
                        : "Please choose a strong password to secure your account."}
                </p>
            </div>

            <div className="glass p-8 rounded-3xl animate-slide-up bg-linear-to-b from-primary/10 via-primary/5 mt-8">
                {!isSuccess ? (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <Input
                                label="New Password"
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
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                }
                            />

                            <Input
                                label="Confirm New Password"
                                name="confirm-password"
                                type={showPassword ? "text" : "password"}
                                required
                                icon={<Lock className="h-4 w-4" />}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-4 bg-linear-to-r from-primary to-primary/80 hover:opacity-90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <span>RESET PASSWORD</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </form>
                ) : (
                    <div className="text-center space-y-6 py-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-2">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            You can now sign in with your new credentials.
                        </p>
                        <Link href="/login" className="block">
                            <Button className="w-full py-3.5 px-4 bg-linear-to-r from-primary to-primary/80 hover:opacity-90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transform active:scale-[0.98] transition-all">
                                SIGN IN NOW
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <PublicNavbar />
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute top-1/2 -right-24 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="text-muted-foreground font-medium">Loading reset form...</p>
                    </div>
                }>
                    <ResetPasswordForm />
                </Suspense>

                <p className="text-center text-xs text-gray-400 mt-12">
                    &copy; 2025 Teamzen Pvt. Ltd. All rights reserved.
                </p>
            </div>
        </div>
    );
}
