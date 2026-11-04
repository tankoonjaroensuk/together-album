import { describe, expect, it } from 'vitest'
import { getNearestIndex, getStringY, stepSpring, stepSwing } from './polaroid-line-physics'

describe('getStringY', () => {
  it('sits at the anchor height at both ends', () => {
    expect(getStringY(0, 400, 30, 40)).toBe(30)
    expect(getStringY(400, 400, 30, 40)).toBe(30)
  })

  it('sags by the full amount in the middle', () => {
    expect(getStringY(200, 400, 30, 40)).toBe(70)
  })

  it('stays at the anchor height beyond the ends', () => {
    expect(getStringY(-50, 400, 30, 40)).toBe(30)
  })
})

describe('stepSpring', () => {
  it('settles on the target without overshooting', () => {
    let state: [number, number] = [0, 0]
    let farthest = 0
    for (let frame = 0; frame < 600; frame++) {
      state = stepSpring(state[0], state[1], 100, 1 / 60)
      farthest = Math.max(farthest, state[0])
    }
    expect(state[0]).toBeCloseTo(100, 1)
    expect(farthest).toBeLessThan(100.5)
  })
})

describe('stepSwing', () => {
  it('tilts a hanging print against the direction the line moves', () => {
    const [angle] = stepSwing(0, 0, 500, 1 / 60, 1)
    expect(angle).toBeGreaterThan(0)
  })

  it('holds the print still when the gain is zero', () => {
    expect(stepSwing(0, 0, 500, 1 / 60, 0)).toEqual([0, 0])
  })

  it('never swings past the maximum angle', () => {
    let state: [number, number] = [0, 0]
    for (let frame = 0; frame < 120; frame++) state = stepSwing(state[0], state[1], 1e6, 1 / 60, 1)
    expect(Math.abs(state[0])).toBeLessThanOrEqual(0.6)
  })
})

describe('getNearestIndex', () => {
  it('picks the print closest to the centre', () => {
    expect(getNearestIndex(330, 100, 6)).toBe(3)
  })

  it('stays within the list when dragged past either end', () => {
    expect(getNearestIndex(-80, 100, 6)).toBe(0)
    expect(getNearestIndex(900, 100, 6)).toBe(5)
  })

  it('returns the first index for an empty list', () => {
    expect(getNearestIndex(300, 100, 0)).toBe(0)
  })
})
