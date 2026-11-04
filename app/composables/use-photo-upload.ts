import { describeRejections, getPhotoIdentity, getPhotoRejectionReason } from '~/utils/photo-validation'
import type { PhotoRejectionReason } from '~/utils/photo-validation'

export type PhotoUploadStatus = 'pending' | 'uploading' | 'uploaded' | 'failed'

export interface SelectedPhoto {
  id: string
  file: File
  previewUrl: string
  status: PhotoUploadStatus
  /** 0 to 1 while the photo is uploading */
  progress: number
}

const SIMULATED_UPLOAD_STEPS = 10
const SIMULATED_STEP_DELAY_MS = 120
// Lets the failed state and the retry button be seen before the real backend exists
const SIMULATED_FAILURE_RATE = import.meta.dev ? 0.3 : 0
const CONCURRENT_UPLOADS = 3

// Stands in for the real upload request until the backend exists
async function sendPhotoToServer(_file: File, _guestName: string, onProgress: (progress: number) => void) {
  for (let step = 1; step <= SIMULATED_UPLOAD_STEPS; step++) {
    await new Promise(resolve => setTimeout(resolve, SIMULATED_STEP_DELAY_MS))
    if (step === SIMULATED_UPLOAD_STEPS / 2 && Math.random() < SIMULATED_FAILURE_RATE) throw new Error('Simulated network failure')
    onProgress(step / SIMULATED_UPLOAD_STEPS)
  }
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
      knownIdentities.add(identity)
      selectedPhotos.value.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: (await createPhotoThumbnailUrl(file)) ?? URL.createObjectURL(file),
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
    try {
      await sendPhotoToServer(photo.file, guestName.value.trim(), (progress) => {
        photo.progress = progress
      })
      photo.status = 'uploaded'
    } catch (error) {
      console.error(`Failed to upload ${photo.file.name}`, error)
      photo.status = 'failed'
    }
  }

  function reportUploadResult(photoIds: string[]) {
    const results = selectedPhotos.value.filter(photo => photoIds.includes(photo.id))
    const failedCount = results.filter(photo => photo.status === 'failed').length
    const uploadedCount = results.length - failedCount

    if (failedCount === 0) showToast(`อัปโหลดสำเร็จ ${uploadedCount} รูป ขอบคุณมากๆ เลยนะ`)
    else if (uploadedCount === 0) showToast(`ส่งไม่สำเร็จ ${failedCount} รูป ลองใหม่อีกครั้งนะ`)
    else showToast(`ส่งสำเร็จ ${uploadedCount} รูป ส่งไม่สำเร็จ ${failedCount} รูป กด "ลองใหม่" ใต้รูป`)
  }

  async function uploadUnsentPhotos() {
    // Newest first, the same order as on the string, so the photo in view is the first to show progress
    const photoIds = unsentPhotos.value.map(photo => photo.id).reverse()
    await runWithLimit(photoIds, CONCURRENT_UPLOADS, uploadPhoto)
    reportUploadResult(photoIds)
  }

  async function retryPhoto(photoId: string) {
    await uploadPhoto(photoId)
    reportUploadResult([photoId])
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
