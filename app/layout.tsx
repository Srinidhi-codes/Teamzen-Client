import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { Providers } from "./providers";
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
    icon: [{ url: "/images/teamzen_zoomed.webp", type: "image/webp" }],
    apple: [{ url: "/images/teamzen_zoomed.webp" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
