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
            <div className="text-center space-y-6 glass-login p-10 rounded-[32px]">
                <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
                    <ShieldAlert className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Invalid Link</h2>
                <p className="text-white/50">This password reset link is invalid or has expired.</p>
                <Link href="/forgot-password" size="sm" className="inline-block mt-2">
                    <Button variant="link" className="text-purple-400 font-bold hover:text-purple-300">Request a new link</Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="text-center mb-10">
                <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                    <Lock className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Set New Password</h2>
                <p className="mt-3 text-sm text-white/50 leading-relaxed">
                    {isSuccess
                        ? "Your password has been updated successfully."
                        : "Please choose a strong password to secure your account."}
                </p>
            </div>

            <div className="glass-login p-10 rounded-[32px] animate-slide-up">
                {!isSuccess ? (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest px-1">New Password</label>
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

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest px-1">Confirm New Password</label>
                                <Input
                                    name="confirm-password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    icon={<Lock className="h-4 w-4" />}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-white/20 h-[52px] rounded-2xl"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-[56px] bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <span>RESET PASSWORD</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>
                ) : (
                    <div className="text-center space-y-6 py-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <p className="text-sm text-white/50 leading-relaxed">
                            Your credentials have been updated. You can now sign in to your account.
                        </p>
                        <Link href="/login" className="block">
                            <Button className="w-full h-14 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 transform active:scale-[0.98] transition-all">
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
        <div className="min-h-screen flex items-center justify-center login-bg py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <PublicNavbar />
            {/* Background Decorative Elements - Premium Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[20%] right-[15%] w-[30%] h-[30%] bg-fuchsia-600/15 rounded-full blur-[100px] animate-float"></div>
            </div>

            <div className="max-w-[440px] w-full relative z-10">
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                        <p className="text-white/50 font-medium">Loading reset form...</p>
                    </div>
                }>
                    <ResetPasswordForm />
                </Suspense>

                <p className="text-center text-xs text-white/30 tracking-wider mt-12">
                    &copy; 2025 Teamzen Pvt. Ltd. All rights reserved.
                </p>
            </div>
        </div>
    );
}
