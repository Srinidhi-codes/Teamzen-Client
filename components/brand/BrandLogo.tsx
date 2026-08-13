import Image from "next/image";
import Link from "next/link";
import { BrandImages } from "@/lib/brand-images";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  priority?: boolean;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  className?: string;
  size?: number;
  subtitle?: string;
};

export function BrandLogo({
  href = "/",
  priority = false,
  showWordmark = true,
  wordmarkClassName,
  className,
  size = 28,
  subtitle,
}: BrandLogoProps) {
  const mark = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-border/60"
        style={{ width: size + 4, height: size + 4 }}
      >
        <Image
          src={BrandImages.mark}
          alt="Teamzen"
          width={size}
          height={size}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="object-contain"
        />
      </span>
      {showWordmark ? (
        <span className="min-w-0">
          <span
            className={cn(
              "block truncate text-sm font-semibold tracking-tight text-foreground",
              wordmarkClassName
            )}
          >
            Teamzen
          </span>
          {subtitle ? (
            <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );

  if (!href) return mark;
  return (
    <Link href={href} className="inline-flex">
      {mark}
    </Link>
  );
}
