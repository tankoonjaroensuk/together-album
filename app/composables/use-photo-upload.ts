import { canSendUnshrunkPhoto, describeRejections, getPhotoIdentity, getPhotoRejectionReason } from '~/utils/photo-validation'
import type { PhotoRejectionReason } from '~/utils/photo-validation'
import { sendGuestPhoto, UploadRefusedError } from '~/utils/send-guest-photo'
import { shrinkPhoto } from '~/utils/shrink-photo'

export type PhotoUploadStatus = 'pending' | 'uploading' | 'uploaded' | 'failed'

export interface SelectedPhoto {
  id: string
  file: File
  /** The shrunk copy, or the original file when the browser could not shrink it */
  uploadFile: Blob
  previewUrl: string
  status: PhotoUploadStatus
  /** 0 to 1 while the photo is uploading */
  progress: number
  /** Cloudinary's id once uploaded, so the same photo is not hung on the string twice */
  publicId?: string
  /** Why the server refused the last attempt, for the toast; empty when it was not refused */
  refusalMessage?: string
}

const CONCURRENT_UPLOADS = 3

const REFUSAL_MESSAGES: Record<number, string> = {
  403: 'ตอนนี้ปิดรับรูปแล้ว ขอบคุณที่ร่วมแชร์นะ',
  429: 'ส่งรูปเยอะมากในชั่วโมงนี้ รอสักพักแล้วกด "ลองใหม่" ใต้รูปนะ',
}

/** Runs `task` for every item with at most `limit` running at once, so a weak connection is not asked for everything at the same time. */
async function runWithLimit<T>(items: T[], limit: number, task: (item: T) => Promise<void>) {
  const queue = [...items]
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    for (let item = queue.shift(); item !== undefined; item = queue.shift()) await task(item)
  })
  await Promise.all(workers)
}

export function usePhotoUpload() {
  const { showToast } = useToast()
  const recentGuestUploads = useRecentGuestUploads()
  const selectedPhotos = ref<SelectedPhoto[]>([])
  const guestName = ref('')

  const unsentPhotos = computed(() => selectedPhotos.value.filter(photo => photo.status === 'pending' || photo.status === 'failed'))
  const isUploading = computed(() => selectedPhotos.value.some(photo => photo.status === 'uploading'))

  const uploadButtonLabel = computed(() => {
    if (isUploading.value) return 'กำลังอัปโหลด...'
    const hasFailedPhotos = unsentPhotos.value.some(photo => photo.status === 'failed')
    return `${hasFailedPhotos ? 'ส่งอีกครั้ง' : 'อัปโหลด'} ${unsentPhotos.value.length} รูป`
  })

  // One photo at a time: decoding dozens of full-size photos at once would spike a phone's memory
  async function addPhotos(files: File[]) {
    const knownIdentities = new Set(selectedPhotos.value.map(photo => getPhotoIdentity(photo.file)))
    const rejections: PhotoRejectionReason[] = []

    for (const file of files) {
      const identity = getPhotoIdentity(file)
      const rejection = getPhotoRejectionReason(file, knownIdentities.has(identity))
      if (rejection) {
        rejections.push(rejection)
        continue
      }

      const shrunk = await shrinkPhoto(file)
      if (!shrunk && !canSendUnshrunkPhoto(file.size)) {
        rejections.push('too-large-to-send-unshrunk')
        continue
      }

      knownIdentities.add(identity)
      selectedPhotos.value.push({
        id: crypto.randomUUID(),
        file,
        uploadFile: shrunk?.upload ?? file,
        previewUrl: URL.createObjectURL(shrunk?.thumbnail ?? file),
        status: 'pending',
        progress: 0,
      })
    }

    if (rejections.length) showToast(describeRejections(rejections))
  }

  async function uploadPhoto(photoId: string) {
    const photo = selectedPhotos.value.find(candidate => candidate.id === photoId)
    if (!photo) return

    photo.status = 'uploading'
    photo.progress = 0
    photo.refusalMessage = undefined
    try {
      const uploaded = await sendGuestPhoto(photo.uploadFile, guestName.value.trim(), (progress) => {
        photo.progress = progress
      })
      photo.publicId = uploaded.publicId
      photo.status = 'uploaded'
      recentGuestUploads.value.unshift(uploaded)
    } catch (error) {
      console.error(`Failed to upload ${photo.file.name}`, error)
      if (error instanceof UploadRefusedError) photo.refusalMessage = REFUSAL_MESSAGES[error.statusCode]
      photo.status = 'failed'
    }
  }

  function reportUploadResult(photoIds: string[]) {
    const results = selectedPhotos.value.filter(photo => photoIds.includes(photo.id))
    const failedCount = results.filter(photo => photo.status === 'failed').length
    const uploadedCount = results.length - failedCount
    const refusalMessage = results.find(photo => photo.refusalMessage)?.refusalMessage

    if (failedCount === 0) showToast(`อัปโหลดสำเร็จ ${uploadedCount} รูป ขอบคุณมากๆ เลยนะ`)
    else if (refusalMessage) showToast(refusalMessage)
    else if (uploadedCount === 0) showToast(`ส่งไม่สำเร็จ ${failedCount} รูป ลองใหม่อีกครั้งนะ`)
    else showToast(`ส่งสำเร็จ ${uploadedCount} รูป ส่งไม่สำเร็จ ${failedCount} รูป กด "ลองใหม่" ใต้รูป`)
  }

  async function uploadPhotos(photoIds: string[]) {
    await runWithLimit(photoIds, CONCURRENT_UPLOADS, uploadPhoto)
    reportUploadResult(photoIds)
  }

  function uploadUnsentPhotos() {
    // Newest first, the same order as on the string, so the photo in view is the first to show progress
    return uploadPhotos(unsentPhotos.value.map(photo => photo.id).reverse())
  }

  function retryPhoto(photoId: string) {
    return uploadPhotos([photoId])
  }

  // Preview URLs keep their image data in memory until revoked
  onBeforeUnmount(() => {
    for (const photo of selectedPhotos.value) URL.revokeObjectURL(photo.previewUrl)
  })

  return {
    selectedPhotos,
    guestName,
    unsentPhotos,
    isUploading,
    uploadButtonLabel,
    addPhotos,
    uploadUnsentPhotos,
    retryPhoto,
  }
}
