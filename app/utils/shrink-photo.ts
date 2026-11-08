const THUMBNAIL_MAX_SIDE_PX = 600
const THUMBNAIL_JPEG_QUALITY = 0.8
// Sharp on any screen, yet about a fifth of a phone camera's file size
const UPLOAD_MAX_SIDE_PX = 2560
const UPLOAD_JPEG_QUALITY = 0.85
// Transparent PNG areas would turn black in a JPEG
const BACKGROUND_COLOR = '#ffffff'

export interface ShrunkPhoto {
  /** Small copy for the preview on the string */
  thumbnail: Blob
  /** Copy that is sent to the server */
  upload: Blob
}

/**
 * Two JPEG copies of `file` from a single decode, or null when the browser cannot decode it (e.g. HEIC outside Safari).
 * Phone photos are several megapixels; showing or sending dozens of them at full size exhausts a phone's memory and data.
 */
export async function shrinkPhoto(file: File): Promise<ShrunkPhoto | null> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    try {
      const thumbnail = await drawScaledJpeg(bitmap, THUMBNAIL_MAX_SIDE_PX, THUMBNAIL_JPEG_QUALITY)
      const upload = await drawScaledJpeg(bitmap, UPLOAD_MAX_SIDE_PX, UPLOAD_JPEG_QUALITY)
      return thumbnail && upload ? { thumbnail, upload } : null
    } finally {
      bitmap.close()
    }
  } catch {
    return null
  }
}

async function drawScaledJpeg(bitmap: ImageBitmap, maxSidePx: number, quality: number): Promise<Blob | null> {
  const scale = Math.min(1, maxSidePx / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)

  const context = canvas.getContext('2d')
  if (!context) return null
  context.fillStyle = BACKGROUND_COLOR
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

  return new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
}
