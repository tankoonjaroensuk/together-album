export type SwipeDirection = 'next' | 'previous' | 'none'

/** Moves by `step` through a list of `photoCount` photos, wrapping around at both ends. */
export function getWrappedPhotoIndex(currentIndex: number, step: number, photoCount: number): number {
  if (photoCount <= 0) return currentIndex
  return (((currentIndex + step) % photoCount) + photoCount) % photoCount
}

/** A swipe to the left shows the next photo; movements shorter than the threshold are ignored. */
export function getSwipeDirection(swipeDistancePx: number, thresholdPx: number): SwipeDirection {
  if (Math.abs(swipeDistancePx) < thresholdPx) return 'none'
  return swipeDistancePx < 0 ? 'next' : 'previous'
}
