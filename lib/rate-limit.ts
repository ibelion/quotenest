/**
 * Simple in-memory rate limiter
 * For production scale, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Cleans up expired entries periodically
 */
function cleanup() {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanup, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Rate limit check
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param options - Rate limit options
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 15 * 60 * 1000, maxRequests: 10 }
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  const entry = store[key];

  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: now + options.windowMs,
    };
  }

  // Increment count
  entry.count += 1;

  // Check if limit exceeded
  if (entry.count > options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client identifier from request
 * Prioritizes Cloudflare headers, then other proxy headers
 * In production behind Cloudflare, CF-Connecting-IP is the most reliable
 */
export function getClientIdentifier(request: Request): string {
  // Cloudflare headers (most reliable when behind Cloudflare)
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Try to get IP from various headers (common in proxy/CDN setups)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first (original client)
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    // Filter out private/internal IPs if present
    const publicIp = ips.find((ip) => {
      // Basic check for public IP (not starting with private ranges)
      return !ip.startsWith("10.") && 
             !ip.startsWith("192.168.") && 
             !ip.startsWith("172.16.") &&
             !ip.startsWith("172.17.") &&
             !ip.startsWith("172.18.") &&
             !ip.startsWith("172.19.") &&
             !ip.startsWith("172.20.") &&
             !ip.startsWith("172.21.") &&
             !ip.startsWith("172.22.") &&
             !ip.startsWith("172.23.") &&
             !ip.startsWith("172.24.") &&
             !ip.startsWith("172.25.") &&
             !ip.startsWith("172.26.") &&
             !ip.startsWith("172.27.") &&
             !ip.startsWith("172.28.") &&
             !ip.startsWith("172.29.") &&
             !ip.startsWith("172.30.") &&
             !ip.startsWith("172.31.") &&
             ip !== "127.0.0.1";
    });
    if (publicIp) {
      return publicIp;
    }
    // If no public IP found, use first IP anyway
    return ips[0];
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Vercel header
  const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0].trim();
  }

  // Fallback: use a combination of User-Agent and Accept-Language as identifier
  // This is not ideal but provides some protection when IP is unavailable
  const userAgent = request.headers.get("user-agent") || "unknown";
  const acceptLanguage = request.headers.get("accept-language") || "unknown";
  // Create a simple hash-like identifier
  return `fallback:${userAgent.substring(0, 20)}:${acceptLanguage.substring(0, 10)}`.replace(/[^a-zA-Z0-9:]/g, "");
}

