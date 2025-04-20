import { RateLimiterMemory } from 'rate-limiter-flexible';
import { NextResponse } from 'next/server';

// Different rate limiters for different types of endpoints
const standardLimiter = new RateLimiterMemory({
  points: 10, // 10 requests
  duration: 60, // per 60 seconds per IP
});

const authLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 60, // per 60 seconds per IP
});

const sensitiveDataLimiter = new RateLimiterMemory({
  points: 3, // 3 requests
  duration: 60, // per 60 seconds per IP
});

/**
 * Apply rate limiting to an API request
 * @param req The incoming request
 * @param limiterType The type of rate limiter to use
 * @returns A response if rate limit is exceeded, null otherwise
 */
export async function applyRateLimit(
  req: Request, 
  limiterType: 'standard' | 'auth' | 'sensitiveData' = 'standard'
): Promise<NextResponse | null> {
  // Get IP address from request headers or default to unknown
  // In production with proper proxy setup, use x-forwarded-for
  const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  
  // For local development or when no IP is available, don't rate limit
  if (ip === 'unknown' && process.env.NODE_ENV === 'development') {
    return null;
  }
  
  // Select the appropriate rate limiter
  let limiter: RateLimiterMemory;
  switch (limiterType) {
    case 'auth':
      limiter = authLimiter;
      break;
    case 'sensitiveData':
      limiter = sensitiveDataLimiter;
      break;
    default:
      limiter = standardLimiter;
  }
  
  try {
    await limiter.consume(ip);
    return null; // No rate limit exceeded
  } catch (error) {
    // Rate limit exceeded
    console.warn(`Rate limit exceeded for IP: ${ip}, type: ${limiterType}`);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }
} 