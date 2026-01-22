"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/api/hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight, UserPlus, FileText, Check, X } from "lucide-react";

export default function RegisterForm() {
    const router = useRouter();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        first_name: "",
        last_name: "",
        password: "",
        password2: "",
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
            setErrors({ password: "Password does not meet all requirements" });
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br text-black from-indigo-100 via-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"
                    style={{ animationDelay: "1s" }}
                ></div>
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"
                    style={{ animationDelay: "2s" }}
                ></div>
            </div>
            <div className="glass w-full max-w-xl p-8 sm:p-10 space-y-8 animate-scale-in relative z-10">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-indigo-100/50 backdrop-blur-sm shadow-inner">
                            <UserPlus className="w-8 h-8 text-indigo-600" />
                        </div>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                        Create your account
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                        Join our premium payroll system today
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Email Field */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="email"
                                placeholder="Email address"
                                required
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                className="pl-10 block w-full"
                            />
                        </div>

                        {/* Username Field */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Username"
                                required
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData({ ...formData, username: e.target.value })
                                }
                                className="pl-10 block w-full"
                            />
                        </div>

                        {/* Name Fields Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FileText className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    required
                                    value={formData.first_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, first_name: e.target.value })
                                    }
                                    className="pl-10 block w-full"
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FileText className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    required
                                    value={formData.last_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, last_name: e.target.value })
                                    }
                                    className="pl-10 block w-full"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                className="pl-10 block w-full"
                            />
                        </div>

                        {/* Confirm Password Field */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                required
                                value={formData.password2}
                                onChange={(e) =>
                                    setFormData({ ...formData, password2: e.target.value })
                                }
                                className="pl-10 block w-full"
                            />
                        </div>
                    </div>

                    {/* Password Validation Checklist */}
                    <div className="bg-indigo-50/50 rounded-lg p-3 space-y-2 border border-indigo-100/50">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password Requirements</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className={`flex items-center space-x-2 transition-colors duration-200 ${passwordCriteria.length ? "text-green-600" : "text-gray-500"}`}>
                                <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center border ${passwordCriteria.length ? "bg-green-100 border-green-200" : "border-gray-300"}`}>
                                    {passwordCriteria.length && <Check className="w-3 h-3" />}
                                </span>
                                <span>At least 8 characters</span>
                            </div>
                            <div className={`flex items-center space-x-2 transition-colors duration-200 ${passwordCriteria.number ? "text-green-600" : "text-gray-500"}`}>
                                <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center border ${passwordCriteria.number ? "bg-green-100 border-green-200" : "border-gray-300"}`}>
                                    {passwordCriteria.number && <Check className="w-3 h-3" />}
                                </span>
                                <span>Contains a number</span>
                            </div>
                            <div className={`flex items-center space-x-2 transition-colors duration-200 ${passwordCriteria.special ? "text-green-600" : "text-gray-500"}`}>
                                <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center border ${passwordCriteria.special ? "bg-green-100 border-green-200" : "border-gray-300"}`}>
                                    {passwordCriteria.special && <Check className="w-3 h-3" />}
                                </span>
                                <span>Special character</span>
                            </div>
                            <div className={`flex items-center space-x-2 transition-colors duration-200 ${passwordCriteria.uppercase ? "text-green-600" : "text-gray-500"}`}>
                                <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center border ${passwordCriteria.uppercase ? "bg-green-100 border-green-200" : "border-gray-300"}`}>
                                    {passwordCriteria.uppercase && <Check className="w-3 h-3" />}
                                </span>
                                <span>Uppercase letter</span>
                            </div>
                        </div>
                    </div>


                    {Object.keys(errors).length > 0 && (
                        <div className="rounded-xl bg-red-50 p-4 border border-red-100 animate-slide-up">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        There were errors with your submission
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
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

                    <button
                        type="submit"
                        disabled={register.isPending}
                        className="btn-primary w-full flex justify-center items-center gap-2 group transform transition-all hover:scale-[1.02]"
                    >
                        {register.isPending ? "Creating account..." : "Create Account"}
                        {!register.isPending && (
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors hover:underline"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
