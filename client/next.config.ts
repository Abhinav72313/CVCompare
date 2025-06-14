import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.pdf$/,
      use: 'file-loader',
    });

    return config;
  },
};

export default nextConfig;
