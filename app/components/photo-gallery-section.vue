<template>
  <section aria-labelledby="gallery-heading" class="px-2 pb-2 sm:px-3 sm:pb-3">
    <h2 id="gallery-heading" class="px-4 pb-4 text-center font-heading text-2xl text-charcoal sm:text-3xl">
      ภาพของเรา
    </h2>

    <!-- Phones get a row to swipe through; the next photo peeks in at the edge so guests can tell there is more -->
    <div class="-mx-2 sm:-mx-3 md:hidden">
      <div
        ref="slideTrack"
        class="slide-track flex snap-x snap-mandatory gap-2 overflow-x-auto px-[calc((100vw-min(82vw,24rem))/2)]"
        role="region"
        aria-roledescription="carousel"
        aria-label="ภาพของเรา ปัดซ้ายขวาเพื่อดูรูปถัดไป"
        @scroll.passive="updateActiveSlide"
      >
        <gallery-photo-button
          v-for="photo in lightboxPhotos"
          :key="photo.src"
          :photo="photo"
          class="aspect-2/3 w-[min(82vw,24rem)] shrink-0 snap-center"
          @click="openLightbox(photo)"
        />
      </div>

      <div class="mt-4 flex justify-center gap-1">
        <button
          v-for="(photo, index) in lightboxPhotos"
          :key="photo.src"
          type="button"
          class="flex size-6 items-center justify-center"
          :aria-label="`ไปที่รูปที่ ${index + 1}`"
          :aria-current="index === activeSlideIndex || undefined"
          @click="scrollToSlide(index)"
        >
          <span
            class="h-1.5 rounded-full transition-all duration-300"
            :class="index === activeSlideIndex ? 'w-4 bg-gold' : 'w-1.5 bg-charcoal/20'"
          />
        </button>
      </div>
    </div>

    <div class="hidden grid-cols-3 gap-2 md:grid">
      <div class="flex flex-col gap-2">
        <gallery-photo-button
          v-for="photo in leftColumnPhotos"
          :key="photo.src"
          :photo="photo"
          class="aspect-2/3"
          @click="openLightbox(photo)"
        />
      </div>

      <!-- The featured photo stays pinned below the sticky navbar while the side columns scroll past -->
      <gallery-photo-button
        :photo="featuredPhoto"
        class="sticky top-[calc(var(--navbar-height)+0.75rem)] h-[calc(100svh-var(--navbar-height)-1.25rem)]"
        @click="openLightbox(featuredPhoto)"
      />

      <div class="flex flex-col gap-2">
        <gallery-photo-button
          v-for="photo in rightColumnPhotos"
          :key="photo.src"
          :photo="photo"
          class="aspect-2/3"
          @click="openLightbox(photo)"
        />
      </div>
    </div>

    <photo-lightbox v-model:open-photo-index="openPhotoIndex" :photos="lightboxPhotos" />
  </section>
</template>

<script setup lang="ts">
import { featuredPhoto, leftColumnPhotos, lightboxPhotos, rightColumnPhotos } from '~/data/gallery-photos'
import type { GalleryPhoto } from '~/data/gallery-photos'

const openPhotoIndex = ref<number | null>(null)
const slideTrack = ref<HTMLElement | null>(null)
const activeSlideIndex = ref(0)

function openLightbox(photo: GalleryPhoto) {
  openPhotoIndex.value = lightboxPhotos.indexOf(photo)
}

// Every slide is the same width, so the scroll position maps straight to a slide
function getSlideStepPx(track: HTMLElement) {
  const firstSlide = track.children[0] as HTMLElement | undefined
  const gapPx = parseFloat(getComputedStyle(track).columnGap) || 0
  return (firstSlide?.offsetWidth ?? track.clientWidth) + gapPx
}

function updateActiveSlide() {
  const track = slideTrack.value
  if (!track) return
  activeSlideIndex.value = Math.min(lightboxPhotos.length - 1, Math.round(track.scrollLeft / getSlideStepPx(track)))
}

function scrollToSlide(index: number) {
  const track = slideTrack.value
  if (!track) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  track.scrollTo({ left: index * getSlideStepPx(track), behavior: prefersReducedMotion ? 'auto' : 'smooth' })
}
</script>

<style scoped>
/* Swiping is the way through on a phone, so the scrollbar would only add a grey line under the photos */
.slide-track {
  scrollbar-width: none;
}

.slide-track::-webkit-scrollbar {
  display: none;
}
</style>
