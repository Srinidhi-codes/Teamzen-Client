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
  wide?: boolean;
}

export function AuthShell({
  children,
  title,
  description,
  sideImage = AuthImages.employee,
  sideImageAlt = "Teamzen employee workspace illustration",
  wide = false,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-2">
      {/* Background Image Container */}
      <aside className="absolute inset-0 z-0 lg:relative lg:flex lg:flex-col lg:justify-between lg:bg-[#e8eef4] lg:overflow-hidden">
        <Image
          src={sideImage}
          alt={sideImageAlt}
          fill
          priority
          sizes="100vw, (min-width: 1024px) 50vw"
          className="object-cover object-center"
        />
        {/* Overlay: dark on mobile for text readability, gradient on desktop */}
        <div className="absolute inset-0 bg-black/60 lg:bg-gradient-to-t lg:from-black/55 lg:via-black/15 lg:to-black/25" />

        <div className="relative z-10 hidden px-10 pt-12 lg:block">
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

        <div className="relative z-10 hidden max-w-md space-y-4 px-10 pb-12 lg:block">
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

      {/* Form Container */}
      <div className="relative z-10 flex min-h-screen flex-col justify-center px-4 py-12 sm:px-6 lg:px-12 lg:bg-background">
        <div 
          className={cn(
            "mx-auto w-full rounded-2xl bg-background/95 p-6 shadow-2xl backdrop-blur-xl border border-white/20 sm:p-8 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none lg:border-none",
            wide ? "max-w-lg" : "max-w-md"
          )}
        >
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

          <div className="mb-8 space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
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
