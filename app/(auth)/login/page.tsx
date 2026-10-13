import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Teamzen HRMS workforce workspace to access attendance, leave, and payroll.",
  alternates: {
    canonical: "/login",
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
