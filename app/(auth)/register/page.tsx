import RegisterForm from "@/components/auth/RegisterForm";
import { Suspense } from "react";

export default function RegisterPage() {

  return (
    <Suspense fallback={<div>Loading authorization protocol...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
