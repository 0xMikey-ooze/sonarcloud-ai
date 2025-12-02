import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { type NextRequest } from "next/server";

// In-memory fallback rate limiter (simple implementation)
class InMemoryRateLimit {
    private requests: Map<string, number[]> = new Map();
    private windowMs = 10000; // 10 seconds
    private maxRequests = 10;

    async limit(identifier: string): Promise<{ success: boolean }> {
        const now = Date.now();
        const key = identifier;
        
        if (!this.requests.has(key)) {
            this.requests.set(key, []);
        }
        
        const timestamps = this.requests.get(key)!;
        
        // Remove old requests outside the window
        const validTimestamps = timestamps.filter(ts => now - ts < this.windowMs);
        
        if (validTimestamps.length >= this.maxRequests) {
            return { success: false };
        }
        
        validTimestamps.push(now);
        this.requests.set(key, validTimestamps);
        
        return { success: true };
    }
}

// Create rate limiter with fallback
let ratelimitInstance: Ratelimit | InMemoryRateLimit;

try {
    // Try to use Upstash Redis if configured
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    if (redisUrl && redisToken) {
        ratelimitInstance = new Ratelimit({
            redis: new Redis({
                url: redisUrl,
                token: redisToken,
            }),
            limiter: Ratelimit.slidingWindow(10, "10 s"),
            analytics: true,
            prefix: "@upstash/ratelimit",
        });
    } else {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Upstash Redis not configured in production environment');
        }
        console.warn('Upstash Redis not configured, using in-memory rate limiting (dev only)');
        ratelimitInstance = new InMemoryRateLimit();
    }
} catch (error) {
    console.error('Failed to initialize rate limiter, using in-memory fallback:', error);
    ratelimitInstance = new InMemoryRateLimit();
}

export const ratelimit = ratelimitInstance;

// Helper to derive a more reliable identifier for rate limiting
export function getClientIdentifier(request: Pick<NextRequest, "ip" | "headers">): string {
    const forwarded = request.headers.get("x-real-ip")
        || request.headers.get("cf-connecting-ip")
        || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    return request.ip || forwarded || "unknown";
}

// Per-route rate limiters for sensitive endpoints
export function createRouteRateLimiter(requests: number, window: Duration) {
    try {
        const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
        const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
        if (redisUrl && redisToken) {
            return new Ratelimit({
                redis: new Redis({
                    url: redisUrl,
                    token: redisToken,
                }),
                limiter: Ratelimit.slidingWindow(requests, window),
                analytics: true,
                prefix: "@upstash/ratelimit",
            });
        } else {
            // In-memory fallback with custom limits
            return new (class {
                private requests: Map<string, number[]> = new Map();
                private windowMs = parseWindow(window);
                private maxRequests = requests;

                async limit(identifier: string): Promise<{ success: boolean }> {
                    const now = Date.now();
                    const key = identifier;
                    
                    if (!this.requests.has(key)) {
                        this.requests.set(key, []);
                    }
                    
                    const timestamps = this.requests.get(key)!;
                    const validTimestamps = timestamps.filter(ts => now - ts < this.windowMs);
                    
                    if (validTimestamps.length >= this.maxRequests) {
                        return { success: false };
                    }
                    
                    validTimestamps.push(now);
                    this.requests.set(key, validTimestamps);
                    
                    return { success: true };
                }
            })();
        }
    } catch (error) {
        console.error('Failed to create route rate limiter:', error);
        return ratelimitInstance; // Fallback to default
    }
}

// Parse window string (e.g., "10 s", "1 m", "1 h") to milliseconds
function parseWindow(window: string): number {
    const match = window.match(/^(\d+)\s*(s|m|h)$/);
    if (!match) return 10000; // Default 10 seconds
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        default: return 10000;
    }
}

// Pre-configured rate limiters for sensitive endpoints
export const rateLimiters = {
    // OTP endpoints: 5 requests per 10 minutes
    otp: createRouteRateLimiter(5, "10 m"),
    
    // Payment endpoints: 10 requests per minute
    payment: createRouteRateLimiter(10, "1 m"),
    
    // Webhook endpoints: 100 requests per minute (higher limit for webhooks)
    webhook: createRouteRateLimiter(100, "1 m"),
    
    // Spin endpoint: 3 requests per hour
    spin: createRouteRateLimiter(3, "1 h"),
    
    // Admin endpoints: 30 requests per minute
    admin: createRouteRateLimiter(30, "1 m"),
    
    // Default: 10 requests per 10 seconds
    default: ratelimit,
};
