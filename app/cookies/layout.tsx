import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Learn about how Teamzen HRMS uses cookies and local storage to provide secure authentication and theme preferences.",
  alternates: {
    canonical: "/cookies",
  },
};

export default function CookieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
