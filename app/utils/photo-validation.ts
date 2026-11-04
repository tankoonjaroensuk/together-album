export type PhotoRejectionReason = 'not-image' | 'too-large' | 'duplicate'

export const MAX_PHOTO_SIZE_MB = 25

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

/** The same photo picked twice has the same name, size and modified time. */
export function getPhotoIdentity(file: Pick<File, 'name' | 'size' | 'lastModified'>): string {
  return `${file.name}:${file.size}:${file.lastModified}`
}

const REJECTION_LABELS: Record<PhotoRejectionReason, string> = {
  'not-image': 'ไม่ใช่รูปภาพ',
  'too-large': `ไฟล์ใหญ่เกิน ${MAX_PHOTO_SIZE_MB} MB`,
  'duplicate': 'เลือกซ้ำ',
}

/** One sentence for a toast, naming each reason once, e.g. "ข้าม 3 ไฟล์ (ไม่ใช่รูปภาพ, เลือกซ้ำ)". */
export function describeRejections(reasons: PhotoRejectionReason[]): string {
  const uniqueLabels = [...new Set(reasons)].map(reason => REJECTION_LABELS[reason])
  return `ข้าม ${reasons.length} ไฟล์ (${uniqueLabels.join(', ')})`
}
