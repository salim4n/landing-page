import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy configuration for Rust chatbot backend
  async rewrites() {
    return [
      {
        source: '/api/chat/:path*',
        destination: 'https://rust-chatbot-service.onrender.com/:path*',
      },
    ];
  },

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Enable React strict mode
  reactStrictMode: true,

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@tensorflow/tfjs'],
  },

  // Turbopack configuration (empty to silence warning)
  turbopack: {},
};

export default nextConfig;
