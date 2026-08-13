import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "mohasagor.com.bd",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8082",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8082",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
