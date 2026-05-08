import { headers } from 'next/headers'

type RateLimitOptions = {
  limit: number
  windowMs: number
}

type RateLimitBucket = {
  count: number
  resetAt: number
}

const MAX_BUCKETS = 10_000
const CLEANUP_INTERVAL = 100

const globalRateLimit = globalThis as typeof globalThis & {
  __dopamemeRateLimitBuckets?: Map<string, RateLimitBucket>
  __dopamemeRateLimitChecks?: number
}

const buckets =
  globalRateLimit.__dopamemeRateLimitBuckets ??
  new Map<string, RateLimitBucket>()

if (!globalRateLimit.__dopamemeRateLimitBuckets) {
  globalRateLimit.__dopamemeRateLimitBuckets = buckets
}

function cleanupBuckets(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key)
    }
  }

  if (buckets.size <= MAX_BUCKETS) return

  const overflow = buckets.size - MAX_BUCKETS
  const oldestKeys = [...buckets.entries()]
    .sort((a, b) => a[1].resetAt - b[1].resetAt)
    .slice(0, overflow)
    .map(([key]) => key)

  for (const key of oldestKeys) {
    buckets.delete(key)
  }
}

function normalizeRateLimitKey(key: string) {
  return key.slice(0, 512)
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions
) {
  const now = Date.now()
  globalRateLimit.__dopamemeRateLimitChecks =
    (globalRateLimit.__dopamemeRateLimitChecks ?? 0) + 1

  if (globalRateLimit.__dopamemeRateLimitChecks % CLEANUP_INTERVAL === 0) {
    cleanupBuckets(now)
  }

  const normalizedKey = normalizeRateLimitKey(key)
  const existing = buckets.get(normalizedKey)

  if (!existing || existing.resetAt <= now) {
    buckets.set(normalizedKey, { count: 1, resetAt: now + windowMs })

    if (buckets.size > MAX_BUCKETS) {
      cleanupBuckets(now)
    }

    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    }
  }

  existing.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}

export async function getRequestIp() {
  const headerStore = await headers()
  const realIp = headerStore.get('x-real-ip')?.trim()

  if (realIp) {
    return realIp
  }

  return 'unknown'
}
