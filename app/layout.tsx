import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Teamzen",
  description: "Payroll and workforce portal for Teamzen",
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
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
