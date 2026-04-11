import type { NextConfig } from "next";

// When set, /backend/* is reverse-proxied to this origin so browser calls stay
// same-origin (required for Sanctum cookies when API and front are on
// different registrable domains, e.g. *.laravel.cloud + *.vercel.app).
const BACKEND_URL = process.env.LARAVEL_BACKEND_URL;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.ops-board.dev.localhost"],
  async rewrites() {
    if (!BACKEND_URL) return [];
    return [
      {
        source: "/backend/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;