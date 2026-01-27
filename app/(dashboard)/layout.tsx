"use client"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useTokenRefresh } from "@/lib/api/hooks";

export default function Layout({ children }: { children: React.ReactNode }) {
  useTokenRefresh();
  return <DashboardLayout>{children}</DashboardLayout>;
}
