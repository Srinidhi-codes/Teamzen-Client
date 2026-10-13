import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Register Organization",
  description: "Create your organization account on Teamzen HRMS. Manage attendance, payroll, and leaves with ease.",
  alternates: {
    canonical: "/register",
  },
};

export default function RegisterPage() {

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
