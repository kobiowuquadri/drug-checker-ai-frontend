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
      {
        source: "/interactions/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "https://drug-checker-ai-backend.onrender.com/api/v1"}/interactions/:path*`,
      },
      {
        source: "/history/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "https://drug-checker-ai-backend.onrender.com/api/v1"}/history/:path*`,
      },
      {
        source: "/reports/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "https://drug-checker-ai-backend.onrender.com/api/v1"}/reports/:path*`,
      },
    ];
  },
};

export default nextConfig;
