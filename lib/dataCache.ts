'use client'

// In-memory cache for client-side reads of server actions.
// - TTL-based freshness
// - Dedupes concurrent fetches (promise sharing)
// - Drops entry on error so the next call retries
// - Cleared on page reload (not persisted)
//
// Use: `fetchCached('myRoadmap', getMyRoadmap, 60_000)`.
// Call `invalidate('myRoadmap')` after a write to force a refresh next call.

type Entry<T> = {
  value?: T
  promise?: Promise<T>
  expires: number
}

const cache = new Map<string, Entry<unknown>>()

export function fetchCached<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs = 60_000,
): Promise<T> {
  const now = Date.now()
  const existing = cache.get(key) as Entry<T> | undefined

  if (existing) {
    if (existing.value !== undefined && existing.expires > now) {
      return Promise.resolve(existing.value)
    }
    if (existing.promise) return existing.promise
  }

  const promise = (async () => {
    try {
      const value = await loader()
      cache.set(key, { value, expires: Date.now() + ttlMs })
      return value
    } catch (err) {
      cache.delete(key)
      throw err
    }
  })()

  cache.set(key, { promise, expires: 0 } as Entry<T>)
  return promise
}

export function invalidate(key: string): void {
  cache.delete(key)
}

export function prefetch<T>(key: string, loader: () => Promise<T>, ttlMs = 60_000): void {
  fetchCached(key, loader, ttlMs).catch(() => { /* swallow — fire-and-forget */ })
}
