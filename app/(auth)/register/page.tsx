import RegisterForm from "@/components/auth/RegisterForm";
import { Suspense } from "react";

export default function RegisterPage() {

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
