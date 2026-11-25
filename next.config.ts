import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: [
    '192.168.100.10',
    '192.168.100.10:3000',
    '10.84.1.119',
    '10.84.1.119:3000',
    'localhost:3000',
    '127.0.0.1:3000',
  ],
};

export default nextConfig;
