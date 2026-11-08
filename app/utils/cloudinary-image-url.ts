import type { GuestPhoto } from '#shared/types/guest-photos'

// The only two widths the site asks for, so each photo costs two transformations.
// Grid cells and polaroid prints are at most ~300px wide, so 600px stays sharp on high-density screens.
export const GUEST_PHOTO_THUMBNAIL_WIDTH_PX = 600
export const GUEST_PHOTO_LARGE_WIDTH_PX = 1600

/**
 * URL of `photo` scaled down to at most `maxWidthPx` wide, in the best format and quality the viewer's browser accepts.
 */
export function buildCloudinaryImageUrl(cloudName: string, photo: Pick<GuestPhoto, 'publicId' | 'version'>, maxWidthPx: number): string {
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_limit,w_${maxWidthPx},f_auto,q_auto/v${photo.version}/${photo.publicId}`
}
