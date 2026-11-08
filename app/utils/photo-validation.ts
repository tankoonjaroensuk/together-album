export type PhotoRejectionReason = 'not-image' | 'too-large' | 'too-large-to-send-unshrunk' | 'duplicate'

/** Largest file a guest can pick. Photos are shrunk before sending, so this only needs to fit a 200MP phone photo. */
export const MAX_PHOTO_SIZE_MB = 50
/** Largest file sent as is when the browser cannot shrink it; Cloudinary's free plan refuses images over 10 MB. */
export const MAX_UNSHRUNK_PHOTO_SIZE_MB = 10

const BYTES_PER_MB = 1024 * 1024

/** Why a picked file cannot be added, or null when it can. */
export function getPhotoRejectionReason(
  file: Pick<File, 'type' | 'size'>,
  isAlreadyAdded: boolean,
  maxSizeMb = MAX_PHOTO_SIZE_MB,
): PhotoRejectionReason | null {
  if (!file.type.startsWith('image/')) return 'not-image'
  if (file.size > maxSizeMb * BYTES_PER_MB) return 'too-large'
  if (isAlreadyAdded) return 'duplicate'
  return null
}

/** Whether a photo the browser could not shrink is small enough to send as it is. */
export function canSendUnshrunkPhoto(sizeBytes: number): boolean {
  return sizeBytes <= MAX_UNSHRUNK_PHOTO_SIZE_MB * BYTES_PER_MB
}

/** The same photo picked twice has the same name, size and modified time. */
export function getPhotoIdentity(file: Pick<File, 'name' | 'size' | 'lastModified'>): string {
  return `${file.name}:${file.size}:${file.lastModified}`
}

const REJECTION_LABELS: Record<PhotoRejectionReason, string> = {
  'not-image': 'ไม่ใช่รูปภาพ',
  'too-large': `ไฟล์ใหญ่เกิน ${MAX_PHOTO_SIZE_MB} MB`,
  'too-large-to-send-unshrunk': 'ไฟล์นี้ใหญ่เกินไป',
  'duplicate': 'เลือกซ้ำ',
}

/** One sentence for a toast, naming each reason once, e.g. "ข้าม 3 ไฟล์ (ไม่ใช่รูปภาพ, เลือกซ้ำ)". */
export function describeRejections(reasons: PhotoRejectionReason[]): string {
  const uniqueLabels = [...new Set(reasons)].map(reason => REJECTION_LABELS[reason])
  return `ข้าม ${reasons.length} ไฟล์ (${uniqueLabels.join(', ')})`
}
