/**
 * Compress large public PNGs to WebP for LCP / bandwidth.
 * Run: node scripts/optimize-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve("public/images");

const JOBS = [
  // auth — portrait panels
  { rel: "auth/login-employee.png", width: 1200, quality: 78 },
  { rel: "auth/login-admin.png", width: 1200, quality: 78 },
  { rel: "auth/auth-security.png", width: 1200, quality: 78 },
  // landing
  { rel: "landing/general.png", width: 1920, quality: 78 },
  { rel: "landing/landing-attendance.png", width: 1400, quality: 78 },
  { rel: "landing/landing-leave.png", width: 1400, quality: 78 },
  { rel: "landing/landing-payroll.png", width: 1400, quality: 78 },
  // empty
  { rel: "empty/empty-404.png", width: 1200, quality: 78 },
  { rel: "empty/empty-assistant.png", width: 1000, quality: 78 },
  { rel: "empty/empty-attendance.png", width: 1200, quality: 78 },
  { rel: "empty/empty-events.png", width: 1200, quality: 78 },
  { rel: "empty/empty-feedback.png", width: 1200, quality: 78 },
  { rel: "empty/empty-leaves.png", width: 1200, quality: 78 },
  { rel: "empty/empty-notifications.png", width: 1000, quality: 78 },
  { rel: "empty/empty-payslip.png", width: 1200, quality: 78 },
  { rel: "empty/empty-team.png", width: 1200, quality: 78 },
  // onboarding
  { rel: "onboarding/onboarding-welcome.png", width: 1600, quality: 78 },
  { rel: "onboarding/onboarding-done.png", width: 1200, quality: 78 },
  { rel: "onboarding/preboarding.png", width: 1400, quality: 78 },
  // mobile
  { rel: "mobile/mobile-splash.png", width: 1080, quality: 78 },
  // dashboard heroes
  { rel: "hero/morning.png", width: 1920, quality: 78 },
  { rel: "hero/morning-2.png", width: 1920, quality: 78 },
  { rel: "hero/noon.png", width: 1920, quality: 78 },
  { rel: "hero/noon-2.png", width: 1920, quality: 78 },
  { rel: "hero/evening.png", width: 1920, quality: 78 },
  { rel: "hero/evening-2.png", width: 1920, quality: 78 },
  { rel: "hero/night.png", width: 1920, quality: 78 },
  { rel: "hero/night-2.png", width: 1376, quality: 78 },
  // logos
  { rel: "teamzen_zoomed.png", width: 256, quality: 90 },
  { rel: "Teamzen_Logo.png", width: 512, quality: 88 },
  { rel: "Teamzen_Logo2.png", width: 512, quality: 88 },
];

async function run() {
  for (const job of JOBS) {
    const src = path.join(ROOT, job.rel);
    if (!fs.existsSync(src)) {
      console.warn("skip missing", job.rel);
      continue;
    }
    const out = src.replace(/\.png$/i, ".webp");
    await sharp(src)
      .rotate()
      .resize({ width: job.width, withoutEnlargement: true })
      .webp({ quality: job.quality, effort: 4 })
      .toFile(out);
    const before = fs.statSync(src).size;
    const after = fs.statSync(out).size;
    console.log(
      `${job.rel} → ${path.basename(out)}  ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`
    );
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
