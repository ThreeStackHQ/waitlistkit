/**
 * Simple in-memory rate limiter.
 * Note: resets on process restart and does not scale across multiple instances.
 * For multi-instance deploys, replace with Redis-backed solution (e.g. Upstash).
 */
const store = new Map<string, { count: number; resetAt: number }>();

// Periodically clean up expired entries to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 60_000);
}

/**
 * @param key     Unique key (e.g. `ip:${ip}` or `email:${email}`)
 * @param limit   Max requests per window
 * @param windowMs Window size in milliseconds
 * @returns true if the request is allowed, false if rate-limited
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}
