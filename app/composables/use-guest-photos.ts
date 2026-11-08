import type { GuestPhoto } from '#shared/types/guest-photos'

// With the server's 20-second cache and Cloudinary's indexing delay, another guest's photo appears within about a minute at worst
const REFRESH_INTERVAL_MS = 15_000

/** Photos this visitor uploaded since the page opened, newest first, shown before the server's cached list catches up. */
export function useRecentGuestUploads() {
  return useState<GuestPhoto[]>('recent-guest-uploads', () => [])
}

/** Every guest photo, newest first. Every component that calls this shares one list. */
export function useGuestPhotos() {
  const recentUploads = useRecentGuestUploads()
  const { data: serverPhotos, refresh } = useFetch<GuestPhoto[]>('/api/guest-photos', { key: 'guest-photos', default: () => [] })

  const photos = computed(() => {
    const serverPhotoIds = new Set(serverPhotos.value.map(photo => photo.publicId))
    return [...recentUploads.value.filter(photo => !serverPhotoIds.has(photo.publicId)), ...serverPhotos.value]
  })

  return { photos, refresh }
}

/**
 * Refetches the guest photos every 15 seconds while the tab is visible and `isPaused` is false,
 * so photos from other guests appear without a reload. Call it from one component only, or the list is fetched twice.
 */
export function useGuestPhotosAutoRefresh(isPaused: Ref<boolean>) {
  const { refresh } = useGuestPhotos()

  let refreshTimer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    refreshTimer = setInterval(() => {
      if (!document.hidden && !isPaused.value) refresh()
    }, REFRESH_INTERVAL_MS)
  })
  onBeforeUnmount(() => clearInterval(refreshTimer))
}
