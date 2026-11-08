// Past this many tracked keys, expired windows are cleared out so memory stays small
const MAX_TRACKED_KEYS = 10_000

interface RateLimitWindow {
  startedAt: number
  count: number
}

/**
 * Returns `isAllowed(key)`, true for at most `limit` calls per key within each `windowMs`.
 * Counts live in this server instance's memory only, so a new instance starts from zero: enough to stop a flood, not exact.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number, windowMs: number }) {
  const windows = new Map<string, RateLimitWindow>()

  function removeExpiredWindows(now: number) {
    for (const [key, window] of windows) {
      if (now - window.startedAt >= windowMs) windows.delete(key)
    }
  }

  return function isAllowed(key: string, now = Date.now()): boolean {
    const current = windows.get(key)
    if (!current || now - current.startedAt >= windowMs) {
      if (windows.size >= MAX_TRACKED_KEYS) removeExpiredWindows(now)
      windows.set(key, { startedAt: now, count: 1 })
      return true
    }
    if (current.count >= limit) return false
    current.count++
    return true
  }
}
