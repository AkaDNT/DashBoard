import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }, 
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/images/**",
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // upstream HTTP nội bộ — KHÔNG để http URL này lộ ra client
        destination: `${process.env.INTERNAL_API_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
