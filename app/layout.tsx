import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { Providers } from "./providers";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { CookieConsent } from "@/components/common/CookieConsent";
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

const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_FRONTEND_URL ||
  "https://teamzen-client-v2-beta.vercel.app"
).replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Teamzen — Modern HRMS, Attendance & Payroll Platform",
    template: "%s · Teamzen HRMS",
  },
  description:
    "Teamzen is an all-in-one modern HRMS platform for automated payroll processing, geofenced & face attendance tracking, leave management, and AI workforce intelligence.",
  keywords: [
    "Teamzen",
    "Teamzen HRMS",
    "Teamzen payroll",
    "Teamzen software",
    "HRMS",
    "HRMS software",
    "Human Resource Management System",
    "Payroll software",
    "Attendance management system",
    "Face attendance HRMS",
    "Leave management system",
    "Employee self service portal",
    "Workforce management platform",
    "Indian payroll software",
    "Cloud HRMS",
    "Teamzen app",
  ],
  authors: [{ name: "Teamzen", url: siteUrl }],
  creator: "Teamzen",
  publisher: "Teamzen",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Teamzen HRMS",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Teamzen — Modern HRMS, Attendance & Payroll Platform",
    description:
      "All-in-one HRMS platform for automated payroll processing, geofenced & face attendance, leave management, and workforce intelligence.",
    url: siteUrl,
    siteName: "Teamzen HRMS",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/landing/general.webp",
        width: 1920,
        height: 1080,
        alt: "Teamzen HRMS Platform Overview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Teamzen — Modern HRMS, Attendance & Payroll Platform",
    description:
      "All-in-one HRMS platform for automated payroll, geofenced & face attendance, and workforce clarity.",
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

const JSON_LD_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      "name": "Teamzen",
      "alternateName": ["Teamzen HRMS", "Teamzen Platform"],
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/images/teamzen_zoomed.webp`,
        "caption": "Teamzen HRMS Logo",
      },
      "description":
        "Teamzen is a modern Human Resource Management System (HRMS) providing automated payroll, face attendance, and leave management.",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "Teamzen HRMS",
      "description": "Modern HRMS, Attendance & Payroll Platform for Growing Teams",
      "publisher": {
        "@id": `${siteUrl}/#organization`,
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      "name": "Teamzen HRMS",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web, iOS, Android (PWA)",
      "url": siteUrl,
      "description":
        "Comprehensive cloud HRMS software with geofenced & face attendance, automated payroll processing, leave requests, and AI copilot.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR",
      },
      "featureList": [
        "Automated Payroll Processing & Payslip Generation",
        "Geofenced & Face Attendance Punch-In",
        "Leave Management & Leave Approval Workflows",
        "AI Workplace Copilot & Assistant",
        "Employee Self-Service Dashboard",
        "Company Announcements & Employee Social Feed",
      ],
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_SCHEMA) }}
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Teamzen HRMS" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${landingDisplay.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <PwaRegister />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
