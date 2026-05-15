"use client";

import { useState } from "react";
import { Mail, ArrowLeft, Loader2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { toast } from "sonner";

import { PublicNavbar } from "@/components/common/PublicNavbar";

export default function ForgotPasswordPage() {
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
                description: error.response?.data?.error || "We couldn't process your request. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center login-bg py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <PublicNavbar />
            {/* Background Decorative Elements - Premium Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[20%] right-[15%] w-[30%] h-[30%] bg-fuchsia-600/15 rounded-full blur-[100px] animate-float"></div>
            </div>

            <div className="max-w-[440px] w-full space-y-8 relative z-10">
                <div className="glass-login p-10 rounded-[32px] animate-slide-up">
                    <div className="text-center mb-10">
                        <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                            <Mail className="w-8 h-8 text-purple-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Recover Access</h2>
                        <p className="mt-3 text-sm text-white/50 leading-relaxed">
                            {isSent
                                ? "We've sent a recovery link to your email address."
                                : "Enter your email address and we'll send you a link to reset your password."}
                        </p>
                    </div>

                    {!isSent ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
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

                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-[56px] bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin h-5 w-5" />
                                            <span>Sending Link...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>SEND RECOVERY LINK</span>
                                            <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>

                                <Link
                                    href="/login"
                                    className="flex items-center justify-center gap-2 text-sm font-medium text-white/40 hover:text-white transition-colors py-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to login
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center space-y-6 py-4">
                            <p className="text-sm text-white/60 leading-relaxed">
                                Didn't receive the email? Check your spam folder or try again in a few minutes.
                            </p>
                            <Button
                                onClick={() => setIsSent(false)}
                                variant="outline"
                                className="w-full h-12 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10"
                            >
                                Try a different email
                            </Button>
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 text-sm font-medium text-white/40 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Return to login
                            </Link>
                        </div>
                    )}
                </div>

                <p className="text-center text-xs text-white/30 tracking-wider">
                    &copy; 2025 Teamzen Pvt. Ltd. All rights reserved.
                </p>
            </div>
        </div>
    );
}
