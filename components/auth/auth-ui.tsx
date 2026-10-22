import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const AUTH_INPUT_CLASS =
  "h-11 rounded-xl bg-background/80 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus:border-[#38ABB1] dark:focus:border-[#38ABB1] focus:ring-4 focus:ring-[#38ABB1]/15 backdrop-blur-sm shadow-xs transition-all text-sm placeholder:text-muted-foreground/50";

export function AuthSubmitButton({
  children,
  loading,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        "relative group overflow-hidden inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#38ABB1] hover:bg-[#30969c] active:bg-[#28848a] text-sm font-semibold text-white shadow-md shadow-[#38ABB1]/25 hover:shadow-lg hover:shadow-[#38ABB1]/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none",
        className
      )}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

export function AuthGhostButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium text-muted-foreground transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

export function AuthDivider({ label = "Or continue with" }: { label?: string }) {
  return (
    <div className="relative flex items-center justify-center py-2 text-xs font-medium text-muted-foreground">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
      </div>
      <span className="relative bg-card dark:bg-slate-900 px-3 py-0.5 rounded-full text-[11px] font-medium tracking-wide text-muted-foreground border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {label}
      </span>
    </div>
  );
}

export function AuthFooterLink({
  prompt,
  href,
  label,
}: {
  prompt: string;
  href: string;
  label: string;
}) {
  return (
    <p className="mt-6 text-center text-sm text-muted-foreground">
      {prompt}{" "}
      <Link
        href={href}
        className="font-semibold text-[#38ABB1] dark:text-[#4cd1d7] hover:text-[#2d9399] dark:hover:text-[#6ae3e9] transition-colors underline-offset-4 hover:underline"
      >
        {label}
      </Link>
    </p>
  );
}

export function PasswordChecklist({
  criteria,
}: {
  criteria: { length: boolean; number: boolean; special: boolean; uppercase: boolean };
}) {
  const items = [
    { key: "length" as const, label: "8+ characters" },
    { key: "number" as const, label: "A number" },
    { key: "special" as const, label: "A special character" },
    { key: "uppercase" as const, label: "An uppercase letter" },
  ];

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4">
      <p className="text-sm font-medium text-foreground">Password requirements</p>
      <div className="grid grid-cols-2 gap-2.5 text-sm">
        {items.map((item) => {
          const ok = criteria[item.key];
          return (
            <div
              key={item.key}
              className={cn(
                "flex items-center gap-2 transition-colors",
                ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  ok ? "border-emerald-500/30 bg-emerald-500/10" : "border-border bg-background"
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  className={cn("h-3 w-3", ok ? "opacity-100" : "opacity-0")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="font-medium">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GoogleMark({ className = "h-4 w-4" }: { className?: string } = {}) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function AppleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.61 1.33-.55.63-.99 1.68-.86 2.7.99.08 2.02-.49 2.55-1.18z"/>
    </svg>
  );
}

export function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

