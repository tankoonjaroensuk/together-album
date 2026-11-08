import { describe, expect, it } from 'vitest'
import { buildCloudinaryImageUrl } from './cloudinary-image-url'

describe('buildCloudinaryImageUrl', () => {
  it('scales down, picks format and quality automatically, and keeps the version and folder path', () => {
    expect(buildCloudinaryImageUrl('demo', { publicId: 'together-album/dev/abc123', version: 1700000000 }, 600))
      .toBe('https://res.cloudinary.com/demo/image/upload/c_limit,w_600,f_auto,q_auto/v1700000000/together-album/dev/abc123')
  })
})
