import { describe, expect, it } from 'vitest'
import { createRateLimiter } from './rate-limiter'

describe('createRateLimiter', () => {
  it('allows up to the limit and refuses the next call', () => {
    const isAllowed = createRateLimiter({ limit: 2, windowMs: 1000 })
    expect([isAllowed('ip', 0), isAllowed('ip', 1), isAllowed('ip', 2)]).toEqual([true, true, false])
  })

  it('allows again once the window has passed', () => {
    const isAllowed = createRateLimiter({ limit: 1, windowMs: 1000 })
    isAllowed('ip', 0)
    expect(isAllowed('ip', 1000)).toBe(true)
  })

  it('counts each key separately', () => {
    const isAllowed = createRateLimiter({ limit: 1, windowMs: 1000 })
    isAllowed('first-ip', 0)
    expect(isAllowed('second-ip', 0)).toBe(true)
  })
})
