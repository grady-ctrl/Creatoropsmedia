import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '@/env';

let ratelimit: Ratelimit | null = null;

if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
    prefix: '@upstash/ratelimit',
  });
}

export async function checkRateLimit(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  if (!ratelimit) {
    // No rate limiting in development without Redis
    return { success: true, limit: 10, remaining: 10, reset: new Date() };
  }

  const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
  return { success, limit, remaining, reset: new Date(reset) };
}

export async function checkAPIRateLimit(ip: string): Promise<boolean> {
  const result = await checkRateLimit(`api:${ip}`);
  return result.success;
}

export async function checkAuthRateLimit(email: string): Promise<boolean> {
  const result = await checkRateLimit(`auth:${email}`);
  return result.success;
}
