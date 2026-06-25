import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/users/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "https://drug-checker-ai-backend.onrender.com/api/v1"}/users/:path*`,
      },
      {
        source: "/drugs/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "https://drug-checker-ai-backend.onrender.com/api/v1"}/drugs/:path*`,
      },
    ];
  },
};

export default nextConfig;
