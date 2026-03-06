import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚠️ No rewrites for /api/*. All routing is handled by the Next.js route
  // files in app/api/ (same-origin cookie proxy pattern).
  // A rewrite like "/api/:path* → render-backend/api/:path*" would bypass
  // those handlers, sending requests cross-origin to Django directly and
  // causing cookies to be silently dropped + ERR_TOO_MANY_REDIRECTS loops.
};

export default nextConfig;
