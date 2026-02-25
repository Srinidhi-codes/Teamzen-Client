"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/api/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    User,
    Mail,
    Lock,
    ArrowRight,
    UserPlus,
    FileText,
    Check,
    Fingerprint,
    ShieldCheck,
    Building2,
    Crown,
    Building
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormSelect } from "../common/FormSelect";

export default function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { register } = useAuth();

    // Get plan from search params
    const selectedPlan = searchParams.get('plan') || 'free';

    const [formData, setFormData] = useState({
        email: "",
        username: "",
        first_name: "",
        last_name: "",
        password: "",
        password2: "",
        organization_name: "",
        plan: selectedPlan,
    });
    const [errors, setErrors] = useState<any>({});
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        number: false,
        special: false,
        uppercase: false,
    });

    useEffect(() => {
        const { password } = formData;
        setPasswordCriteria({
            length: password.length >= 8,
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            uppercase: /[A-Z]/.test(password),
        });
    }, [formData.password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.password2) {
            setErrors({ password: "Passwords do not match" });
            return;
        }

        const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
        if (!isPasswordValid) {
            setErrors({ password: "Password does not meet protocol requirements" });
            return;
        }

        try {
            await register.mutateAsync(formData);
            router.push("/dashboard");
        } catch (error: any) {
            setErrors(error.response?.data || { error: "Registration failed" });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute top-1/2 -right-24 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute -bottom-24 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="max-w-xl w-full space-y-8 relative z-10">
                <div className="animate-fade-in text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-tr from-primary to-primary/60 shadow-lg shadow-primary/20 mb-6 transform hover:rotate-6 transition-transform duration-300">
                        <Fingerprint className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h2 className="text-4xl font-black text-foreground tracking-tight">Establish Organization</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Join the elite payroll management ecosystem</p>
                </div>


                <div className="glass-dark p-8 rounded-3xl animate-slide-up bg-linear-to-b from-primary/30 via-primary/15">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* Organization Name Field */}
                            <Input
                                type="text"
                                label="Organization Name"
                                placeholder="Organization Name"
                                required
                                icon={<Building className="h-4 w-4" />}
                                value={formData.organization_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, organization_name: e.target.value })
                                }
                            />

                            {/* Plan Selection Field */}
                            <FormSelect
                                label="Subscription Plan"
                                value={formData.plan}
                                onValueChange={(val) => setFormData({ ...formData, plan: val })}
                                icon={<Crown className="h-4 w-4" />}
                                placeholder="Select a plan"
                                options={[
                                    { value: "free", label: "Free - Up to 10 Employees" },
                                    { value: "pro", label: "Pro - Up to 100 Employees" },
                                    { value: "elite", label: "Elite - Unlimited & AI" },
                                ]}
                            />

                            {/* Email Field */}
                            <Input
                                type="email"
                                label="Email Address"
                                placeholder="Enter your email"
                                required
                                icon={<Mail className="h-4 w-4" />}
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                            />

                            {/* Username Field */}
                            <Input
                                type="text"
                                label="Username"
                                placeholder="Choose a username"
                                required
                                icon={<User className="h-4 w-4" />}
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData({ ...formData, username: e.target.value })
                                }
                            />

                            {/* Name Fields Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    type="text"
                                    label="First Name"
                                    placeholder="First Name"
                                    required
                                    icon={<FileText className="h-4 w-4" />}
                                    value={formData.first_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, first_name: e.target.value })
                                    }
                                />
                                <Input
                                    type="text"
                                    label="Last Name"
                                    placeholder="Last Name"
                                    required
                                    icon={<FileText className="h-4 w-4" />}
                                    value={formData.last_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, last_name: e.target.value })
                                    }
                                />
                            </div>

                            {/* Password Field */}
                            <Input
                                type="password"
                                label="Password"
                                placeholder="Password"
                                required
                                icon={<Lock className="h-4 w-4" />}
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                            />

                            {/* Confirm Password Field */}
                            <Input
                                type="password"
                                label="Confirm Password"
                                placeholder="Confirm Password"
                                required
                                icon={<ShieldCheck className="h-4 w-4" />}
                                value={formData.password2}
                                onChange={(e) =>
                                    setFormData({ ...formData, password2: e.target.value })
                                }
                            />
                        </div>


                        {/* Password Validation Checklist */}
                        <div className="bg-muted/30 rounded-2xl p-4 space-y-3 border border-border">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Security Specifications</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className={`flex items-center space-x-2.5 transition-colors duration-200 ${passwordCriteria.length ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/60"}`}>
                                    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${passwordCriteria.length ? "bg-emerald-500/10 border-emerald-500/20" : "bg-muted/50 border-border"}`}>
                                        <Check className={`w-3 h-3 transition-opacity ${passwordCriteria.length ? "opacity-100" : "opacity-0"}`} />
                                    </div>
                                    <span className="font-bold whitespace-nowrap">8+ Characters</span>
                                </div>
                                <div className={`flex items-center space-x-2.5 transition-colors duration-200 ${passwordCriteria.number ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/60"}`}>
                                    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${passwordCriteria.number ? "bg-emerald-500/10 border-emerald-500/20" : "bg-muted/50 border-border"}`}>
                                        <Check className={`w-3 h-3 transition-opacity ${passwordCriteria.number ? "opacity-100" : "opacity-0"}`} />
                                    </div>
                                    <span className="font-bold whitespace-nowrap">Numeric Integration</span>
                                </div>
                                <div className={`flex items-center space-x-2.5 transition-colors duration-200 ${passwordCriteria.special ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/60"}`}>
                                    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${passwordCriteria.special ? "bg-emerald-500/10 border-emerald-500/20" : "bg-muted/50 border-border"}`}>
                                        <Check className={`w-3 h-3 transition-opacity ${passwordCriteria.special ? "opacity-100" : "opacity-0"}`} />
                                    </div>
                                    <span className="font-bold whitespace-nowrap">Special Symbol</span>
                                </div>
                                <div className={`flex items-center space-x-2.5 transition-colors duration-200 ${passwordCriteria.uppercase ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/60"}`}>
                                    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${passwordCriteria.uppercase ? "bg-emerald-500/10 border-emerald-500/20" : "bg-muted/50 border-border"}`}>
                                        <Check className={`w-3 h-3 transition-opacity ${passwordCriteria.uppercase ? "opacity-100" : "opacity-0"}`} />
                                    </div>
                                    <span className="font-bold whitespace-nowrap">Uppercase Required</span>
                                </div>
                            </div>
                        </div>



                        {Object.keys(errors).length > 0 && (
                            <div className="rounded-2xl bg-destructive/5 p-4 border border-destructive/10 animate-slide-up">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-black text-destructive uppercase tracking-widest">
                                            Validation Failure
                                        </h3>
                                        <div className="mt-2 text-sm text-destructive/80 font-medium">
                                            <ul className="list-disc pl-5 space-y-1">
                                                {Object.values(errors).map((err: any, i) => (
                                                    <li key={i}>
                                                        {typeof err === "string" ? err : JSON.stringify(err)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={register.isPending}
                            className="bg-primary text-primary-foreground w-full py-4 px-6 rounded-xl font-black text-sm uppercase tracking-widest flex justify-center items-center gap-2 group transform transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50"
                        >
                            {register.isPending ? "Processing..." : "Initiate Registration"}
                            {!register.isPending && (
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border text-center">
                        <p className="text-sm text-muted-foreground font-medium">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-black text-primary hover:opacity-80 transition-opacity"
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
                    &copy; 2025 Teamzen Pvt. Ltd. Core System v1.0.
                </p>
            </div>
        </div>
    );
}
