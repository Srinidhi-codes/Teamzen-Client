import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { Providers } from "./providers";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const landingDisplay = Sora({
  variable: "--font-landing-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Teamzen — HRMS for modern teams",
    template: "%s · Teamzen",
  },
  description:
    "Attendance, leave, and payroll in one calm workforce workspace.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Teamzen",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Teamzen — HRMS for modern teams",
    description:
      "Attendance, leave, and payroll in one calm workforce workspace.",
    images: [
      {
        url: "/images/landing/general.webp",
        width: 1920,
        height: 1080,
        alt: "Teamzen workforce platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Teamzen — HRMS for modern teams",
    description:
      "Attendance, leave, and payroll in one calm workforce workspace.",
    images: ["/images/landing/general.webp"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/images/teamzen_zoomed.webp", type: "image/webp" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#090a0f" },
  ],
};

const THEME_BOOT_SCRIPT = `
(function() {
  try {
    var root = document.documentElement;
    var storage = localStorage.getItem('payroll-app-storage');
    var accent = 'teal';
    if (storage) {
      var parsed = JSON.parse(storage);
      var state = parsed && parsed.state;
      if (state && state.accent) accent = state.accent;
      else if (state && state.user && state.user.organization && state.user.organization.accent) {
        accent = state.user.organization.accent;
      }
      var org = state && state.user && state.user.organization;
      var plan = org && (org.plan || '').toLowerCase();
      var expires = org && (org.planExpiresAt || org.plan_expires_at);
      var paid = plan === 'pro' || plan === 'elite';
      if (paid && expires) {
        var end = new Date(expires);
        if (!isNaN(end.getTime())) {
          var today = new Date();
          today.setHours(0,0,0,0);
          end.setHours(0,0,0,0);
          if (end < today) paid = false;
        }
      }
      if (!paid) accent = 'teal';
    }
    root.setAttribute('data-accent', accent);

    var theme = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = theme === 'dark' || ((theme === 'system' || !theme) && prefersDark);
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  } catch (e) {
    document.documentElement.setAttribute('data-accent', 'teal');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ scrollbarGutter: "stable" }} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${landingDisplay.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <PwaRegister />
        </Providers>
      </body>
    </html>
  );
}
