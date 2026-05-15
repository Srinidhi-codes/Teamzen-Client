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
import Image from "next/image";

import { PublicNavbar } from "../common/PublicNavbar";

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
        <div className="min-h-screen flex items-center justify-center login-bg py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <PublicNavbar />
            {/* Background Decorative Elements - Premium Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[20%] right-[15%] w-[30%] h-[30%] bg-fuchsia-600/15 rounded-full blur-[100px] animate-float"></div>
            </div>

            <div className="max-w-2xl w-full space-y-8 relative z-10">
                <div className="glass-login p-10 rounded-[32px] animate-slide-up">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 shadow-xl shadow-purple-500/5 mb-6 overflow-hidden p-3 backdrop-blur-sm transform transition-transform hover:scale-105 duration-300">
                            <Image 
                                src="/images/teamzen_zoomed.png" 
                                alt="Teamzen" 
                                width={64} 
                                height={64} 
                                className="w-full h-full object-contain brightness-110"
                                loading="lazy"
                            />
                        </div>
                        <h2 className="text-4xl font-bold text-white tracking-tight">Establish Organization</h2>
                        <p className="mt-3 text-sm text-white/50 uppercase tracking-widest font-medium">Join the elite payroll management ecosystem</p>
                    </div>


                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* Organization Name Field */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest px-1">Organization Details</label>
                                <Input
                                    type="text"
                                    placeholder="Organization Name"
                                    required
                                    icon={<Building className="h-4 w-4" />}
                                    value={formData.organization_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, organization_name: e.target.value })
                                    }
                                    className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-white/20 h-[52px] rounded-2xl"
                                />
                            </div>

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
                                className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white h-[52px] rounded-2xl"
                            />

                            <div className="pt-2">
                                <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest px-1">Administrative Access</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1.5">
                                    <Input
                                        type="email"
                                        placeholder="Email Address"
                                        required
                                        icon={<Mail className="h-4 w-4" />}
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-white/20 h-[52px] rounded-2xl"
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Username"
                                        required
                                        icon={<User className="h-4 w-4" />}
                                        value={formData.username}
                                        onChange={(e) =>
                                            setFormData({ ...formData, username: e.target.value })
                                        }
                                        className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-white/20 h-[52px] rounded-2xl"
                                    />
                                </div>
                            </div>

                            {/* Name Fields Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    type="text"
                                    placeholder="First Name"
                                    required
                                    icon={<FileText className="h-4 w-4" />}
                                    value={formData.first_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, first_name: e.target.value })
                                    }
                                    className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-white/20 h-[52px] rounded-2xl"
                                />
                                <Input
                                    type="text"
                                    placeholder="Last Name"
                                    required
                                    icon={<FileText className="h-4 w-4" />}
                                    value={formData.last_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, last_name: e.target.value })
                                    }
                                    className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-white/20 h-[52px] rounded-2xl"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    required
                                    icon={<Lock className="h-4 w-4" />}
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-white/20 h-[52px] rounded-2xl"
                                />
                                <Input
                                    type="password"
                                    placeholder="Confirm Password"
                                    required
                                    icon={<ShieldCheck className="h-4 w-4" />}
                                    value={formData.password2}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password2: e.target.value })
                                    }
                                    className="bg-white/5 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-white/20 h-[52px] rounded-2xl"
                                />
                            </div>
                        </div>


                        {/* Password Validation Checklist */}
                        <div className="bg-white/5 rounded-2xl p-5 space-y-3 border border-white/10">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Security Specifications</p>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className={`flex items-center space-x-2.5 transition-colors duration-200 ${passwordCriteria.length ? "text-emerald-400" : "text-white/20"}`}>
                                    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${passwordCriteria.length ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/10"}`}>
                                        <Check className={`w-3 h-3 transition-opacity ${passwordCriteria.length ? "opacity-100" : "opacity-0"}`} />
                                    </div>
                                    <span className="font-bold">8+ Characters</span>
                                </div>
                                <div className={`flex items-center space-x-2.5 transition-colors duration-200 ${passwordCriteria.number ? "text-emerald-400" : "text-white/20"}`}>
                                    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${passwordCriteria.number ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/10"}`}>
                                        <Check className={`w-3 h-3 transition-opacity ${passwordCriteria.number ? "opacity-100" : "opacity-0"}`} />
                                    </div>
                                    <span className="font-bold">Numbers</span>
                                </div>
                                <div className={`flex items-center space-x-2.5 transition-colors duration-200 ${passwordCriteria.special ? "text-emerald-400" : "text-white/20"}`}>
                                    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${passwordCriteria.special ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/10"}`}>
                                        <Check className={`w-3 h-3 transition-opacity ${passwordCriteria.special ? "opacity-100" : "opacity-0"}`} />
                                    </div>
                                    <span className="font-bold">Special Symbol</span>
                                </div>
                                <div className={`flex items-center space-x-2.5 transition-colors duration-200 ${passwordCriteria.uppercase ? "text-emerald-400" : "text-white/20"}`}>
                                    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${passwordCriteria.uppercase ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/10"}`}>
                                        <Check className={`w-3 h-3 transition-opacity ${passwordCriteria.uppercase ? "opacity-100" : "opacity-0"}`} />
                                    </div>
                                    <span className="font-bold">Uppercase</span>
                                </div>
                            </div>
                        </div>


                        {Object.keys(errors).length > 0 && (
                            <div className="rounded-2xl bg-red-500/5 p-4 border border-red-500/10 animate-slide-up">
                                <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">
                                    Validation Failure
                                </h3>
                                <div className="text-xs text-red-400/80 font-medium">
                                    <ul className="list-disc pl-5 space-y-1">
                                        {Object.values(errors).map((err: any, i) => (
                                            <li key={i}>
                                                {typeof err === "string" ? err : JSON.stringify(err)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={register.isPending}
                            className="w-full h-[56px] bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/20 transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
                        >
                            {register.isPending ? "Processing..." : "INITIATE REGISTRATION"}
                            {!register.isPending && (
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-sm text-white/40 font-medium">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-bold text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                    &copy; 2025 Teamzen Pvt. Ltd. All rights reserved.
                </p>
            </div>
        </div>
    );
}
