/**
 * Central image paths (WebP). Prefer these with next/image.
 * Use `priority` only for LCP candidates (landing hero, auth panel, dashboard hero).
 */
export const BrandImages = {
  mark: "/images/teamzen_zoomed.webp",
  logo: "/images/Teamzen_Logo.webp",
  logoAlt: "/images/Teamzen_Logo2.webp",
  assistantChat: "/images/icons/assistant-chat.webp",
  assistantMark: "/images/icons/assistant-mark.webp",
} as const;

/** Channel marks for the landing Everywhere showcase. Served through next/image, which re-encodes to WebP. */
export const ChannelImages = {
  slack: "/images/icons/slack.jpg",
  telegram: "/images/icons/telegram.jpg",
  whatsapp: "/images/icons/whatsapp.jpg",
  mcp: "/images/icons/mcp.png",
} as const;

export const AuthImages = {
  employee: "/images/auth/login-employee.webp",
  admin: "/images/auth/login-admin.webp",
  security: "/images/auth/auth-security.webp",
} as const;

export const LandingImages = {
  hero: "/images/landing/general.webp",
  attendance: "/images/landing/landing-attendance.webp",
  leave: "/images/landing/landing-leave.webp",
  payroll: "/images/landing/landing-payroll.webp",
} as const;

export const EmptyImages = {
  notFound: "/images/empty/empty-404.webp",
  assistant: "/images/empty/empty-assistant.webp",
  attendance: "/images/empty/empty-attendance.webp",
  events: "/images/empty/empty-events.webp",
  feedback: "/images/empty/empty-feedback.webp",
  leaves: "/images/empty/empty-leaves.webp",
  notifications: "/images/empty/empty-notifications.webp",
  payslip: "/images/empty/empty-payslip.webp",
  team: "/images/empty/empty-team.webp",
} as const;

export const OnboardingImages = {
  welcome: "/images/onboarding/onboarding-welcome.webp",
  done: "/images/onboarding/onboarding-done.webp",
  preboarding: "/images/onboarding/preboarding.webp",
} as const;

export const MobileImages = {
  splash: "/images/mobile/mobile-splash.webp",
} as const;

export const HeroImages = {
  morning: { day1: "/images/hero/morning.webp", day2: "/images/hero/morning-2.webp" },
  noon: { day1: "/images/hero/noon.webp", day2: "/images/hero/noon-2.webp" },
  evening: { day1: "/images/hero/evening.webp", day2: "/images/hero/evening-2.webp" },
  night: { day1: "/images/hero/night.webp", day2: "/images/hero/night-2.webp" },
} as const;
