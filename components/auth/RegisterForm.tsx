"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/api/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    User,
    Mail,
    Lock,
    FileText,
    Check,
    ShieldCheck,
    Building,
    Crown,
} from "lucide-react";
import { Input } from "../ui/input";
import { FormSelect } from "../common/FormSelect";
import { AuthShell } from "./AuthShell";

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
            setErrors({ password: "Password does not meet requirements" });
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
        <AuthShell
            title="Create account"
            description="Set up your organization and admin access."
        >
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Organization name
                        </label>
                        <Input
                            type="text"
                            placeholder="Organization name"
                            required
                            icon={<Building className="h-4 w-4" />}
                            value={formData.organization_name}
                            onChange={(e) =>
                                setFormData({ ...formData, organization_name: e.target.value })
                            }
                        />
                    </div>

                    <FormSelect
                        label="Plan"
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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Email</label>
                            <Input
                                type="email"
                                placeholder="you@company.com"
                                required
                                icon={<Mail className="h-4 w-4" />}
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Username</label>
                            <Input
                                type="text"
                                placeholder="Username"
                                required
                                icon={<User className="h-4 w-4" />}
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData({ ...formData, username: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">First name</label>
                            <Input
                                type="text"
                                placeholder="First name"
                                required
                                icon={<FileText className="h-4 w-4" />}
                                value={formData.first_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, first_name: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Last name</label>
                            <Input
                                type="text"
                                placeholder="Last name"
                                required
                                icon={<FileText className="h-4 w-4" />}
                                value={formData.last_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, last_name: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Password</label>
                            <Input
                                type="password"
                                placeholder="Password"
                                required
                                icon={<Lock className="h-4 w-4" />}
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Confirm password</label>
                            <Input
                                type="password"
                                placeholder="Confirm password"
                                required
                                icon={<ShieldCheck className="h-4 w-4" />}
                                value={formData.password2}
                                onChange={(e) =>
                                    setFormData({ ...formData, password2: e.target.value })
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                    <p className="text-sm font-medium text-foreground">Password requirements</p>
                    <div className="grid grid-cols-2 gap-2.5 text-sm">
                        {[
                            { key: "length" as const, label: "8+ characters" },
                            { key: "number" as const, label: "A number" },
                            { key: "special" as const, label: "A special character" },
                            { key: "uppercase" as const, label: "An uppercase letter" },
                        ].map((item) => (
                            <div
                                key={item.key}
                                className={`flex items-center gap-2 transition-colors ${
                                    passwordCriteria[item.key]
                                        ? "text-emerald-600"
                                        : "text-muted-foreground"
                                }`}
                            >
                                <div
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                        passwordCriteria[item.key]
                                            ? "border-emerald-600/30 bg-emerald-500/10"
                                            : "border-border bg-background"
                                    }`}
                                >
                                    <Check
                                        className={`h-3 w-3 transition-opacity ${
                                            passwordCriteria[item.key] ? "opacity-100" : "opacity-0"
                                        }`}
                                    />
                                </div>
                                <span className="font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                        <p className="mb-1.5 text-sm font-medium text-destructive">
                            Please fix the following
                        </p>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-destructive/80">
                            {Object.values(errors).map((err: any, i) => (
                                <li key={i}>
                                    {typeof err === "string" ? err : JSON.stringify(err)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={register.isPending}
                    className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                    {register.isPending ? "Creating account…" : "Create account"}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                    Sign in
                </Link>
            </p>
        </AuthShell>
    );
}
