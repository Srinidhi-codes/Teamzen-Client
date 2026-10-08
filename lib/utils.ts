import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveAvatarUrl(url?: any): string | undefined {
  if (!url) return undefined;
  const raw = typeof url === "string" ? url : (typeof url?.url === "string" ? url.url : undefined);
  if (!raw || typeof raw !== "string" || !raw.trim()) return undefined;
  const trimmed = raw.trim();

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/";
  const backendBase = rawApiUrl.replace(/\/api\/?$/, "");
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${backendBase}${cleanPath}`;
}
