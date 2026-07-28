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
  title: "Teamzen — HRMS for modern teams",
  description:
    "Attendance, leave, and payroll in one calm workforce workspace.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ scrollbarGutter: "stable" }} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storage = localStorage.getItem('payroll-app-storage');
                  if (storage) {
                    var state = JSON.parse(storage);
                    if (state && state.state && state.state.accent) {
                      document.documentElement.setAttribute('data-accent', state.state.accent);
                    } else {
                      document.documentElement.setAttribute('data-accent', 'teal');
                    }
                  } else {
                    document.documentElement.setAttribute('data-accent', 'teal');
                  }
                } catch (e) {
                  document.documentElement.setAttribute('data-accent', 'teal');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${landingDisplay.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
