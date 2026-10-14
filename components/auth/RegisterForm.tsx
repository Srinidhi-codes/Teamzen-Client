"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/api/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandImages } from "@/lib/brand-images";
import {
  User,
  Mail,
  Lock,
  Building,
  Crown,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { FormSelect } from "../common/FormSelect";
import { PasswordChecklist } from "./auth-ui";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();

  const selectedPlan = searchParams.get("plan") || "free";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
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
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 font-sans selection:bg-[#38ABB1]/30 selection:text-[#38ABB1] overflow-hidden"
      style={{
        backgroundColor: "#03090a",
        backgroundImage:
          "radial-gradient(ellipse 90% 65% at 50% -15%, rgba(56, 171, 177, 0.35), transparent 70%), radial-gradient(ellipse 60% 50% at 100% 40%, rgba(56, 171, 177, 0.2), transparent 65%), radial-gradient(ellipse 55% 45% at 0% 70%, rgba(43, 138, 143, 0.18), transparent 60%)",
      }}
    >
      {/* Subtle landing grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          maskImage: "linear-gradient(180deg, black 0%, transparent 85%)",
          WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 85%)",
          backgroundImage:
            "linear-gradient(to right, rgba(56, 171, 177, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 171, 177, 0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      {/* Centered Floating Card Matching Landing Page Black & Teal Palette */}
      <div
        className="relative z-10 w-full max-w-[1080px] rounded-3xl overflow-hidden flex flex-col lg:flex-row my-6"
        style={{
          backgroundColor: "#061315",
          border: "1px solid rgba(56, 171, 177, 0.28)",
          boxShadow:
            "0 25px 70px -15px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(56, 171, 177, 0.22), 0 0 45px -10px rgba(56, 171, 177, 0.18)",
        }}
      >
        {/* Mobile Header Banner (Visible on < lg screens) */}
        <div className="relative w-full h-44 overflow-hidden lg:hidden">
          <Image
            src="/images/auth/login-geometric-teal.webp"
            alt="Welcome pattern"
            fill
            priority
            sizes="100vw"
            className="object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-[#061315]/60 to-transparent" />
          <div className="relative z-10 p-6 flex flex-col justify-end h-full text-white">
            <h2 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">
              Welcome Aboard.
            </h2>
            <p className="text-xs text-white/85 line-clamp-2 mt-1">
              Set up your organization workspace in minutes.
            </p>
          </div>
        </div>

        {/* Left Section: Register Form */}
        <div className="relative z-20 w-full lg:w-[60%] p-7 sm:p-9 md:p-10 lg:p-12 flex flex-col justify-center">
          
          {/* Prominent Teamzen Brand Header */}
          <div className="mb-6 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-[#38ABB1]/40 p-1.5 transition-transform group-hover:scale-105">
                <Image
                  src={BrandImages.mark}
                  alt="Teamzen logo"
                  width={36}
                  height={36}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white leading-tight group-hover:text-[#38ABB1] transition-colors">
                  Teamzen
                </span>
                <span className="text-[11px] font-medium text-[#38ABB1]/90">
                  Workforce Portal
                </span>
              </div>
            </Link>

            <Link
              href="/login"
              className="text-xs font-semibold text-[#38ABB1] hover:text-[#52cdd3] hover:underline transition-colors"
            >
              Sign In Instead
            </Link>
          </div>

          {/* Form Header */}
          <div className="mb-6 space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">Create account</h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-[#38ABB1] hover:text-[#52cdd3] hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Registration Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-3.5">
              
              {/* Organization Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300" htmlFor="organization_name">
                  Organization name <span className="text-[#38ABB1]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="organization_name"
                    type="text"
                    placeholder="e.g. Acme Corporation"
                    required
                    value={formData.organization_name}
                    onChange={(e) =>
                      setFormData({ ...formData, organization_name: e.target.value })
                    }
                    className="w-full h-11 pl-10 pr-4 rounded-lg text-sm text-white placeholder:text-[#589ea3] focus:outline-none focus:border-[#38ABB1] focus:ring-2 focus:ring-[#38ABB1]/30 transition-all shadow-sm"
                    style={{
                      backgroundColor: "#07181a",
                      border: "1px solid #164649",
                    }}
                  />
                  <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-[#38ABB1]/80 pointer-events-none" />
                </div>
              </div>

              {/* Plan Selector */}
              <div className="space-y-1.5">
                <FormSelect
                  label="Workforce Plan"
                  value={formData.plan}
                  onValueChange={(val) => setFormData({ ...formData, plan: val })}
                  icon={<Crown className="h-4 w-4 text-[#38ABB1]" />}
                  placeholder="Select a plan"
                  className="border-[#164649] bg-[#07181a] text-white placeholder:text-[#589ea3]"
                  options={[
                    { value: "free", label: "Free — ₹0/mo · Up to 10 employees" },
                    { value: "pro", label: "Pro — ₹3,999/mo · Up to 100 employees" },
                    { value: "elite", label: "Elite — ₹14,999/mo · Unlimited & AI" },
                  ]}
                />
              </div>

              {/* Email & Username Row */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300" htmlFor="reg-email">
                    Work Email <span className="text-[#38ABB1]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-email"
                      type="email"
                      placeholder="you@company.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-11 pl-10 pr-4 rounded-lg text-sm text-white placeholder:text-[#589ea3] focus:outline-none focus:border-[#38ABB1] focus:ring-2 focus:ring-[#38ABB1]/30 transition-all shadow-sm"
                      style={{
                        backgroundColor: "#07181a",
                        border: "1px solid #164649",
                      }}
                    />
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#38ABB1]/80 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300" htmlFor="reg-username">
                    Username <span className="text-[#38ABB1]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-username"
                      type="text"
                      placeholder="Username"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full h-11 pl-10 pr-4 rounded-lg text-sm text-white placeholder:text-[#589ea3] focus:outline-none focus:border-[#38ABB1] focus:ring-2 focus:ring-[#38ABB1]/30 transition-all shadow-sm"
                      style={{
                        backgroundColor: "#07181a",
                        border: "1px solid #164649",
                      }}
                    />
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#38ABB1]/80 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* First Name & Last Name Row */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300" htmlFor="reg-first-name">
                    First name <span className="text-[#38ABB1]">*</span>
                  </label>
                  <input
                    id="reg-first-name"
                    type="text"
                    placeholder="First name"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg text-sm text-white placeholder:text-[#589ea3] focus:outline-none focus:border-[#38ABB1] focus:ring-2 focus:ring-[#38ABB1]/30 transition-all shadow-sm"
                    style={{
                      backgroundColor: "#07181a",
                      border: "1px solid #164649",
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300" htmlFor="reg-last-name">
                    Last name <span className="text-[#38ABB1]">*</span>
                  </label>
                  <input
                    id="reg-last-name"
                    type="text"
                    placeholder="Last name"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg text-sm text-white placeholder:text-[#589ea3] focus:outline-none focus:border-[#38ABB1] focus:ring-2 focus:ring-[#38ABB1]/30 transition-all shadow-sm"
                    style={{
                      backgroundColor: "#07181a",
                      border: "1px solid #164649",
                    }}
                  />
                </div>
              </div>

              {/* Password & Confirm Password Row */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300" htmlFor="reg-password">
                    Password <span className="text-[#38ABB1]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full h-11 pl-10 pr-10 rounded-lg text-sm text-white placeholder:text-[#589ea3] focus:outline-none focus:border-[#38ABB1] focus:ring-2 focus:ring-[#38ABB1]/30 transition-all shadow-sm"
                      style={{
                        backgroundColor: "#07181a",
                        border: "1px solid #164649",
                      }}
                    />
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#38ABB1]/80 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300" htmlFor="reg-password2">
                    Confirm password <span className="text-[#38ABB1]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password2"
                      type={showPassword2 ? "text" : "password"}
                      placeholder="Confirm password"
                      required
                      value={formData.password2}
                      onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                      className="w-full h-11 pl-10 pr-10 rounded-lg text-sm text-white placeholder:text-[#589ea3] focus:outline-none focus:border-[#38ABB1] focus:ring-2 focus:ring-[#38ABB1]/30 transition-all shadow-sm"
                      style={{
                        backgroundColor: "#07181a",
                        border: "1px solid #164649",
                      }}
                    />
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#38ABB1]/80 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword2(!showPassword2)}
                      className="absolute right-3 top-3.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      aria-label={showPassword2 ? "Hide password" : "Show password"}
                    >
                      {showPassword2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Criteria Checklist */}
            <PasswordChecklist criteria={passwordCriteria} />

            {/* Error Display */}
            {Object.keys(errors).length > 0 && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-300">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <p className="text-xs font-semibold text-red-200">Please fix the following</p>
                </div>
                <ul className="list-disc space-y-0.5 pl-5 text-xs text-red-300/90">
                  {Object.values(errors).map((err: any, i) => (
                    <li key={i}>{typeof err === "string" ? err : JSON.stringify(err)}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Button: Styled with signature Teamzen teal button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={register.isPending}
                className="h-11 px-9 rounded-full bg-gradient-to-r from-[#38ABB1] via-[#339fa5] to-[#267c82] hover:from-[#42bec4] hover:to-[#2c8d93] active:scale-[0.99] text-white font-bold text-xs tracking-wider uppercase shadow-md shadow-[#38ABB1]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                {register.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {register.isPending ? "CREATING ACCOUNT…" : "CREATE ACCOUNT"}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <p className="mt-6 text-center text-xs text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[#38ABB1] hover:text-[#52cdd3] hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Right Section: Low-Poly Diagonal Polygonal Panel in Teamzen Teal (Desktop) */}
        <div
          className="hidden lg:block absolute inset-0 pointer-events-none select-none overflow-hidden rounded-3xl"
          style={{ clipPath: "polygon(56% 0%, 100% 0%, 100% 100%, 86% 100%)" }}
        >
          <Image
            src="/images/auth/login-geometric-teal.webp"
            alt="Geometric low-poly crystal pattern"
            fill
            priority
            sizes="45vw"
            className="object-cover object-right"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#061315]/40 via-transparent to-[#03090a]/65" />

          {/* Welcome Text Content */}
          <div className="absolute top-16 right-8 lg:right-14 z-10 flex flex-col items-end text-right max-w-[280px] lg:max-w-[320px]">
            <h2 className="text-4xl lg:text-[48px] font-extrabold tracking-tight text-white drop-shadow-md leading-[1.08]">
              Welcome
              <br />
              Aboard.
            </h2>
            <p className="mt-4 text-xs lg:text-sm text-white/90 leading-relaxed font-normal max-w-[260px] lg:max-w-[290px] drop-shadow-sm">
              Set up your organization workspace in minutes to automate attendance, leave tracking, and payroll processing.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
