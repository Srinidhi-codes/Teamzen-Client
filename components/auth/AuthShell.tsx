import Image from "next/image";
import Link from "next/link";
import { AuthImages, BrandImages } from "@/lib/brand-images";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  /** Override left-panel art (default: employee login). */
  sideImage?: string;
  sideImageAlt?: string;
}

export function AuthShell({
  children,
  title,
  description,
  sideImage = AuthImages.employee,
  sideImageAlt = "Teamzen employee workspace illustration",
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-[#e8eef4] lg:flex lg:flex-col lg:justify-between">
        <Image
          src={sideImage}
          alt={sideImageAlt}
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25" />

        <div className="relative z-10 px-10 pt-12">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white">
              <Image
                src={BrandImages.mark}
                alt="Teamzen"
                width={32}
                height={32}
                priority
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">Teamzen</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md space-y-4 px-10 pb-12">
          <h1 className="text-3xl font-semibold tracking-tight text-balance text-white">
            Your workforce portal
          </h1>
          <p className="text-sm leading-relaxed text-white/75">
            Check attendance, request leave, view payroll, and stay on top of team updates.
          </p>
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} Teamzen Pvt. Ltd.
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-12">
        <div className="mx-auto w-full max-w-100">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-card ring-1 ring-border">
                <Image
                  src={BrandImages.mark}
                  alt="Teamzen"
                  width={28}
                  height={28}
                  priority
                  className="h-7 w-7 object-contain"
                />
              </div>
              <span className="text-base font-semibold text-foreground">Teamzen</span>
            </Link>
          </div>

          <div className="mb-8 space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>

          {children}

          <p className={cn("mt-10 text-center text-xs text-muted-foreground lg:hidden")}>
            © {new Date().getFullYear()} Teamzen Pvt. Ltd.
          </p>
        </div>
      </div>
    </div>
  );
}
