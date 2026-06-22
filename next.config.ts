import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/users/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "https://drug-checker-ai-backend.onrender.com/api/v1"}/users/:path*`,
      },
    ];
  },
};

export default nextConfig;
