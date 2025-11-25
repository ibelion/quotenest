import type { NextConfig } from "next";
import { existsSync, rmSync } from "fs";
import { join } from "path";

// Clean up cache directory before build (for Cloudflare Pages)
// This prevents large cache files from being included in deployment
if (process.env.CF_PAGES === "1" || process.env.CI === "true") {
  const cacheDir = join(process.cwd(), ".next", "cache");
  if (existsSync(cacheDir)) {
    try {
      rmSync(cacheDir, { recursive: true, force: true });
      console.log("✓ Cleaned .next/cache directory");
    } catch (error) {
      console.warn("⚠ Failed to clean cache directory:", error);
    }
  }
}

const nextConfig: NextConfig = {
  // Security headers
  async headers() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quotenest.com";
    
    // Content Security Policy
    // Note: 'unsafe-inline' and 'unsafe-eval' are needed for Next.js
    // For stricter CSP, consider using nonces (requires additional Next.js config)
    const isProduction = process.env.NODE_ENV === "production";
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://www.google.com https://www.google-analytics.com https://vitals.vercel-insights.com",
      "frame-src https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      ...(isProduction ? ["upgrade-insecure-requests"] : []),
    ]
      .filter((directive) => directive.length > 0)
      .join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: cspDirectives,
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
        ],
      },
    ];
  },
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Compression
  compress: true,
  // Performance optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Exclude cache from output (Cloudflare Pages compatibility)
  outputFileTracingExcludes: {
    "*": [
      ".next/cache/**",
      "node_modules/@swc/core-*/**",
      "node_modules/webpack/**",
    ],
  },
};

export default nextConfig;
