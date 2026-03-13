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
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <PublicNavbar />
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute -bottom-24 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                <div className="animate-fade-in text-center">
                    <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Recover Access</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {isSent
                            ? "We've sent a recovery link to your email address."
                            : "Enter your email address and we'll send you a link to reset your password."}
                    </p>
                </div>

                <div className="glass p-8 rounded-3xl animate-slide-up bg-linear-to-b from-primary/10 via-primary/5">
                    {!isSent ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <Input
                                id="email-address"
                                label="Email Address"
                                name="email"
                                type="email"
                                required
                                icon={<Mail className="h-4 w-4" />}
                                placeholder="you@organization.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <div className="space-y-4">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 px-4 bg-linear-to-r from-primary to-primary/80 hover:opacity-90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                                    className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to login
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center space-y-6 py-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
                                <Mail className="w-8 h-8" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Didn't receive the email? Check your spam folder or try again in a few minutes.
                            </p>
                            <Button
                                onClick={() => setIsSent(false)}
                                variant="outline"
                                className="w-full rounded-xl border-primary/20 hover:bg-primary/5"
                            >
                                Try a different email
                            </Button>
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Return to login
                            </Link>
                        </div>
                    )}
                </div>

                <p className="text-center text-xs text-gray-400">
                    &copy; 2025 Teamzen Pvt. Ltd. All rights reserved.
                </p>
            </div>
        </div>
    );
}
