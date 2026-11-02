import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The inherited unused features contain thousands of legacy ESLint errors.
  // Keep build/type validation on while those modules are migrated incrementally.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
