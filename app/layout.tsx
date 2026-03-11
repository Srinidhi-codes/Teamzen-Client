import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Payroll Management System",
  description: "Enterprise payroll and leave management solution",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow user zoom but prevent auto-zoom loops
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
