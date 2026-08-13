import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Teamzen",
  description:
    "How Teamzen collects, uses, and protects personal and workplace data, including Google Calendar integration.",
};

const LAST_UPDATED = "30 July 2026";
const CONTACT_EMAIL = "connectifyappmails@gmail.com";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-card ring-1 ring-border">
              <Image
                src="/images/teamzen_zoomed.webp"
                alt="Teamzen"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
            </div>
            <span className="text-sm font-semibold tracking-tight">Teamzen</span>
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          This Privacy Policy explains how Teamzen (&quot;Teamzen&quot;, &quot;we&quot;,
          &quot;us&quot;, or &quot;our&quot;) collects, uses, stores, and shares information
          when you use our HR and workforce platform, including our web apps, APIs, AI
          assistant, messaging bots, and optional third-party integrations such as Google
          Calendar.
        </p>

        <div className="prose-legal mt-10 space-y-10 text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">1. Who we are</h2>
            <p>
              Teamzen is a human resources and workforce management product that helps
              organizations manage attendance, leave, payroll, policies, and related
              employee workflows. Teamzen is provided to your employer or organization
              (the &quot;Organization&quot;). Your Organization is typically the controller
              of workplace HR data; Teamzen processes that data to provide the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">2. Information we collect</h2>
            <p>Depending on how you and your Organization use Teamzen, we may process:</p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <span className="text-foreground">Account &amp; profile data</span> — name,
                work email, phone number, employee ID, role, department, designation,
                manager, joining date, and similar employment fields.
              </li>
              <li>
                <span className="text-foreground">Attendance &amp; leave data</span> —
                check-in/out times, geofence-related location used for attendance
                verification, leave balances, leave requests, approvals, and corrections.
              </li>
              <li>
                <span className="text-foreground">Payroll data</span> — salary structures,
                payslips, deductions, and related payroll run information as configured by
                your Organization.
              </li>
              <li>
                <span className="text-foreground">Communications</span> — messages you send
                to the Teamzen AI assistant, Telegram/Slack bots, in-app notifications, and
                support emails.
              </li>
              <li>
                <span className="text-foreground">Technical data</span> — device/session
                metadata, IP address, approximate location when required for security or
                attendance, cookies/auth tokens, and audit logs of sensitive actions.
              </li>
              <li>
                <span className="text-foreground">Optional integrations</span> — tokens and
                limited calendar data when you connect Google Calendar (see below).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">
              3. Google Calendar integration
            </h2>
            <p>
              If you choose to connect Google Calendar from Teamzen (Profile → Integrations),
              we request access to the Google scope{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                https://www.googleapis.com/auth/calendar.events
              </code>
              . That allows Teamzen to:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                Create an all-day calendar event when your leave request is{" "}
                <span className="text-foreground">approved</span> (for example, titled
                &quot;Leave: Casual Leave&quot;).
              </li>
              <li>
                Delete that event if the approved leave is later cancelled (when we stored
                the Google event ID).
              </li>
              <li>
                Read calendar events in a date range you (or the AI assistant) ask about, so
                we can <span className="text-foreground">advise</span> on conflicts before
                applying for leave. This is advisory and does not block leave by itself.
              </li>
            </ul>
            <p>
              We store OAuth tokens (access/refresh) associated with your Teamzen account so
              the integration can keep working until you disconnect it. We do not sell Google
              Calendar data. We do not use Google user data for advertising. Google Calendar
              data is used only to provide the leave-sync and conflict-check features you
              enable.
            </p>
            <p>
              You can disconnect Google Calendar at any time from{" "}
              <strong>Profile → Integrations</strong>, which removes the stored connection
              from Teamzen. You may also revoke Teamzen&apos;s access in your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                className="text-primary underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Account permissions
              </a>
              .
            </p>
            <p className="text-muted-foreground">
              Teamzen&apos;s use and transfer of information received from Google APIs
              adheres to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                className="text-primary underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">4. How we use information</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Provide attendance, leave, payroll, policy, and HR assistant features.</li>
              <li>Authenticate users and secure accounts (including OTP and optional 2FA).</li>
              <li>Send operational notifications (email, in-app, Telegram/Slack when linked).</li>
              <li>Improve reliability, prevent abuse, and maintain audit trails.</li>
              <li>Comply with legal obligations and Organization instructions.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">5. AI assistant</h2>
            <p>
              When you use the Teamzen AI assistant (web chat or linked bots), your prompts
              and tool results may be processed by configured language-model providers (such
              as OpenAI, Google Gemini, or Groq) according to your Organization&apos;s AI
              settings, solely to generate responses and take permitted HR actions (for
              example, checking leave balance or submitting a leave request on your behalf
              after confirmation).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">6. Sharing of information</h2>
            <p>We may share information with:</p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                Your Organization&apos;s authorized admins, HR, and managers as required for
                normal HR workflows.
              </li>
              <li>
                Service providers that host or operate the product (for example cloud
                hosting, email delivery, databases), under contractual safeguards.
              </li>
              <li>
                Integration providers you connect (Google, Slack, Telegram) as needed to
                operate those features.
              </li>
              <li>Authorities when required by law or to protect rights and safety.</li>
            </ul>
            <p>We do not sell personal information.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">7. Retention</h2>
            <p>
              We retain HR and account data for as long as your Organization maintains an
              account and as needed for employment, payroll, compliance, and audit purposes.
              Integration tokens are retained until you disconnect the integration or your
              account is removed. You may ask your Organization admin or contact us to
              request deletion subject to legal and contractual retention requirements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">8. Security</h2>
            <p>
              We use industry-standard measures such as encrypted transport (HTTPS),
              authenticated APIs, access controls, and audit logging. No method of
              transmission or storage is 100% secure; please use strong credentials and
              enable available security features.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">9. Your choices &amp; rights</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Update profile information in Teamzen where your Organization allows it.</li>
              <li>Disconnect Google Calendar or messaging bots at any time.</li>
              <li>
                Request access, correction, or deletion via your Organization admin or by
                emailing us (below). Some requests must be handled by your employer as data
                controller.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">10. Children</h2>
            <p>
              Teamzen is a workplace product and is not directed to children under 16. We do
              not knowingly collect personal information from children.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">11. Changes</h2>
            <p>
              We may update this Privacy Policy from time to time. The &quot;Last
              updated&quot; date at the top will change when we do. Continued use of Teamzen
              after changes means you acknowledge the updated policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">12. Contact</h2>
            <p>
              For privacy questions about Teamzen, contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline-offset-2 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              . For HR data held by your employer, contact your Organization&apos;s HR or
              admin first.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/60 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Teamzen</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
