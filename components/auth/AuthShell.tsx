import Image from "next/image";
import Link from "next/link";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AuthShell({ children, title, description }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-[oklch(0.28_0.04_200)] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, oklch(0.55 0.09 200 / 0.45), transparent 45%), radial-gradient(circle at 80% 80%, oklch(0.4 0.06 220 / 0.35), transparent 40%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white">
              <Image
                src="/images/teamzen_zoomed.png"
                alt="Teamzen"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="text-lg font-semibold tracking-tight">Teamzen</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            Your workforce portal
          </h1>
          <p className="text-sm leading-relaxed text-white/70">
            Check attendance, request leave, view payroll, and stay on top of team updates.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/45">
          © {new Date().getFullYear()} Teamzen Pvt. Ltd.
        </p>
      </aside>

      <div className="flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-12">
        <div className="mx-auto w-full max-w-100">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-card ring-1 ring-border">
                <Image
                  src="/images/teamzen_zoomed.png"
                  alt="Teamzen"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <span className="text-base font-semibold text-foreground">Teamzen</span>
            </Link>
          </div>

          <div className="mb-8 space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          {children}

          <p className="mt-10 text-center text-xs text-muted-foreground lg:hidden">
            © {new Date().getFullYear()} Teamzen Pvt. Ltd.
          </p>
        </div>
      </div>
    </div>
  );
}
