import 'server-only'

/**
 * Simple in-memory sliding-window rate limiter.
 * Keyed by an identifier (e.g. IP or email).
 * NOT shared across serverless instances — acceptable for single-server
 * deployments; for multi-instance, replace with Redis or Supabase-based limiter.
 */

type Entry = { timestamps: number[] }

const buckets = new Map<string, Entry>()

// Evict stale keys every 5 minutes to prevent unbounded memory growth
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  const cutoff = now - windowMs
  for (const [key, entry] of buckets) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff)
    if (entry.timestamps.length === 0) buckets.delete(key)
  }
}

export function rateLimit(
  key: string,
  { maxAttempts, windowMs }: { maxAttempts: number; windowMs: number },
): { allowed: boolean; retryAfterMs: number } {
  cleanup(windowMs)

  const now = Date.now()
  const cutoff = now - windowMs
  let entry = buckets.get(key)

  if (!entry) {
    entry = { timestamps: [] }
    buckets.set(key, entry)
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff)

  if (entry.timestamps.length >= maxAttempts) {
    const oldest = entry.timestamps[0]
    return { allowed: false, retryAfterMs: oldest + windowMs - now }
  }

  entry.timestamps.push(now)
  return { allowed: true, retryAfterMs: 0 }
}
