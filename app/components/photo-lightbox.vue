<template>
  <dialog
    ref="dialogElement"
    class="photo-lightbox m-0 size-full max-h-none max-w-none bg-transparent p-0 text-champagne backdrop:bg-black/90 backdrop:backdrop-blur-sm"
    aria-label="ดูรูปขนาดเต็ม"
    @close="onDialogClosed"
    @keydown.arrow-left.prevent="showPreviousPhoto"
    @keydown.arrow-right.prevent="showNextPhoto"
  >
    <div
      class="flex size-full items-center justify-center px-4 py-16 sm:px-20"
      @click.self="closeDialog"
      @touchstart.passive="rememberTouchStart"
      @touchend="showPhotoFromSwipe"
    >
      <img
        v-if="currentPhoto"
        :key="currentPhoto.src"
        :src="currentPhoto.src"
        :alt="currentPhoto.alt"
        class="photo-lightbox-image max-h-full max-w-full rounded-lg object-contain shadow-2xl shadow-black/60"
      >
    </div>

    <p class="absolute left-1/2 top-5 -translate-x-1/2 font-mono text-xs tracking-wide text-champagne/70">
      {{ photoCounterLabel }}
    </p>

    <button
      type="button"
      :class="[ICON_BUTTON_CLASS, 'right-3 top-3']"
      aria-label="ปิด"
      @click="closeDialog"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>

    <button
      type="button"
      :class="[ICON_BUTTON_CLASS, 'left-3 top-1/2 -translate-y-1/2']"
      aria-label="รูปก่อนหน้า"
      @click="showPreviousPhoto"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 5l-7 7 7 7" />
      </svg>
    </button>

    <button
      type="button"
      :class="[ICON_BUTTON_CLASS, 'right-3 top-1/2 -translate-y-1/2']"
      aria-label="รูปถัดไป"
      @click="showNextPhoto"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </dialog>
</template>

<script setup lang="ts">
import type { GalleryPhoto } from '~/types/gallery-photo'

const props = defineProps<{ photos: GalleryPhoto[] }>()
const openPhotoIndex = defineModel<number | null>('openPhotoIndex', { required: true })

const SWIPE_THRESHOLD_PX = 50
const ICON_BUTTON_CLASS = 'absolute flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-white/20 active:scale-95'

const dialogElement = ref<HTMLDialogElement | null>(null)
const lenis = useLenis()
let touchStartX = 0

const currentPhoto = computed(() => {
  if (openPhotoIndex.value === null) return null
  return props.photos[openPhotoIndex.value] ?? null
})

const photoCounterLabel = computed(() => `${(openPhotoIndex.value ?? 0) + 1} / ${props.photos.length}`)

watch(openPhotoIndex, (index) => {
  if (index === null || dialogElement.value?.open) return
  dialogElement.value?.showModal()
  // Lenis keeps smoothing wheel input underneath a modal dialog, so the page would scroll behind it
  lenis.value?.stop()
})

function closeDialog() {
  dialogElement.value?.close()
}

// Runs for every way the dialog closes: the close button, a backdrop click and the Esc key
function onDialogClosed() {
  openPhotoIndex.value = null
  lenis.value?.start()
}

function showNextPhoto() {
  movePhotoIndexBy(1)
}

function showPreviousPhoto() {
  movePhotoIndexBy(-1)
}

function movePhotoIndexBy(step: number) {
  if (openPhotoIndex.value === null) return
  const photoCount = props.photos.length
  openPhotoIndex.value = (openPhotoIndex.value + step + photoCount) % photoCount
}

function rememberTouchStart(event: TouchEvent) {
  touchStartX = event.changedTouches[0]?.clientX ?? 0
}

function showPhotoFromSwipe(event: TouchEvent) {
  const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX
  const swipeDistancePx = touchEndX - touchStartX
  if (Math.abs(swipeDistancePx) < SWIPE_THRESHOLD_PX) return

  if (swipeDistancePx < 0) showNextPhoto()
  else showPreviousPhoto()
}
</script>

<style scoped>
.photo-lightbox[open],
.photo-lightbox[open]::backdrop {
  animation: fade-in 0.25s ease-out;
}

.photo-lightbox-image {
  animation: zoom-in 0.3s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .photo-lightbox[open],
  .photo-lightbox[open]::backdrop,
  .photo-lightbox-image {
    animation: none;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

@keyframes zoom-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
}
</style>
