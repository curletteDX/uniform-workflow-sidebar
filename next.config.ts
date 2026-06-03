import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@uniformdev/mesh-sdk-react',
    '@uniformdev/design-system',
    '@react-icons/all-files',
  ],
};

export default nextConfig;
