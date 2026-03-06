import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  // ⚠️ No rewrites for /api/*. All routing is handled by the Next.js route
  // files in app/api/ (same-origin cookie proxy pattern).
  // A rewrite like "/api/:path* → render-backend/api/:path*" would bypass
  // those handlers, sending requests cross-origin to Django directly and
  // causing cookies to be silently dropped + ERR_TOO_MANY_REDIRECTS loops.
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
