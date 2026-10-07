"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Cookie, ShieldCheck, Settings, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/">
          <Button variant="ghost" className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Cookie className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Cookie Policy</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                1. What are cookies?
              </h2>
              <p>
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide a better user experience. Cookies help us remember your preferences, keep your session secure, and understand how you interact with our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">2. How we use cookies</h2>
              <p>
                Teamzen uses cookies for several purposes, ranging from strictly necessary functions (like keeping you logged in) to preference tracking (like remembering your dark mode setting). We categorize our cookies into three main types:
              </p>

              <div className="mt-6 grid gap-6 sm:grid-cols-1 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <ShieldCheck className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Strictly Essential</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Required for the website to function properly. These cannot be disabled.
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground list-disc pl-4">
                    <li>Authentication tokens</li>
                    <li>Session security</li>
                    <li>CSRF protection</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <Settings className="h-8 w-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Preferences & Theme</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Used to remember your UI choices and personalize your experience.
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground list-disc pl-4">
                    <li>Dark/Light mode</li>
                    <li>Sidebar state</li>
                    <li>Color accents</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <Activity className="h-8 w-8 text-purple-500 mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Performance Analytics</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Helps us understand how visitors interact with our platform anonymously.
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground list-disc pl-4">
                    <li>Page load speeds</li>
                    <li>Error tracking</li>
                    <li>Feature usage</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">3. Managing your cookies</h2>
              <p>
                When you first visit Teamzen, you are presented with a cookie consent banner that allows you to customize your preferences. You can accept all cookies, reject non-essential ones, or tailor them to your liking.
              </p>
              <p>
                <strong>Note on Logging Out:</strong> Your cookie preferences are stored securely in your browser's local storage. When you log out of Teamzen, we carefully preserve your cookie consent choices so you won't be asked to accept them again the next time you log in or visit the site.
              </p>
              <p>
                If you wish to revoke or change your consent entirely, you can clear your browser's local storage and cookies, which will prompt the banner to reappear on your next visit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">4. Third-party cookies</h2>
              <p>
                We do not sell your data or use third-party advertising cookies. Any third-party cookies used on our platform are strictly for operational purposes (e.g., securely processing authentications or measuring anonymous performance metrics).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">5. Contact us</h2>
              <p>
                If you have any questions about our use of cookies or this Cookie Policy, please contact our support team or refer to our main <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
