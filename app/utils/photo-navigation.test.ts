import { describe, expect, it } from 'vitest'
import { getSwipeDirection, getWrappedPhotoIndex } from './photo-navigation'

describe('getWrappedPhotoIndex', () => {
  it('moves forward within the list', () => {
    expect(getWrappedPhotoIndex(1, 1, 5)).toBe(2)
  })

  it('wraps from the last photo to the first', () => {
    expect(getWrappedPhotoIndex(4, 1, 5)).toBe(0)
  })

  it('wraps from the first photo to the last', () => {
    expect(getWrappedPhotoIndex(0, -1, 5)).toBe(4)
  })

  it('keeps the index when the list is empty', () => {
    expect(getWrappedPhotoIndex(0, 1, 0)).toBe(0)
  })
})

describe('getSwipeDirection', () => {
  it('shows the next photo for a swipe to the left', () => {
    expect(getSwipeDirection(-80, 50)).toBe('next')
  })

  it('shows the previous photo for a swipe to the right', () => {
    expect(getSwipeDirection(80, 50)).toBe('previous')
  })

  it('ignores movements shorter than the threshold', () => {
    expect(getSwipeDirection(-49, 50)).toBe('none')
  })
})
