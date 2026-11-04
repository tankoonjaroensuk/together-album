const THUMBNAIL_MAX_SIDE_PX = 600
const THUMBNAIL_JPEG_QUALITY = 0.8

/**
 * Object URL of a small JPEG copy of `file`, or null when the browser cannot decode it.
 * Phone photos are several megapixels; showing dozens of them at full size exhausts the memory of a phone.
 */
export async function createPhotoThumbnailUrl(file: File): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, THUMBNAIL_MAX_SIDE_PX / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const thumbnail = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', THUMBNAIL_JPEG_QUALITY))
    return thumbnail ? URL.createObjectURL(thumbnail) : null
  } catch {
    return null
  }
}
