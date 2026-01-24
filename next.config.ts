import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Trigger rebuild for CSS updates
  async rewrites() {
    const isDev = process.env.NODE_ENV === 'development';
    const backendUrl = isDev ? "http://localhost:8000" : "https://teamzen-server.onrender.com";

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
         source: "/graphql/",
         destination: `${backendUrl}/graphql/`, 
      }
    ];
  },
};

export default nextConfig;
