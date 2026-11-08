<template>
  <!-- Linked from the upload section; the scroll margin keeps the heading clear of the sticky navbar -->
  <section id="guest-photos" aria-labelledby="guest-photos-heading" class="scroll-mt-(--navbar-height) px-2 pb-16 pt-12 sm:px-3 sm:pb-24">
    <h2 id="guest-photos-heading" class="px-4 text-center font-heading text-2xl text-charcoal sm:text-3xl">
      ภาพจากแขก
    </h2>

    <template v-if="galleryPhotos.length">
      <p class="pb-4 pt-1 text-center text-sm text-taupe">{{ galleryPhotos.length }} รูป</p>
      <div class="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-5">
        <gallery-photo-button
          v-for="(photo, index) in galleryPhotos"
          :key="photo.src"
          :photo="photo"
          class="aspect-square"
          @click="openPhotoIndex = index"
        />
      </div>
    </template>
    <p v-else class="pt-2 text-center text-taupe">
      ยังไม่มีรูปจากแขก <a href="#upload" class="font-semibold text-charcoal underline underline-offset-4">มาเป็นคนแรกที่แชร์รูปกัน</a>
    </p>

    <photo-lightbox v-model:open-photo-index="openPhotoIndex" :photos="galleryPhotos" />
  </section>
</template>

<script setup lang="ts">
import type { GalleryPhoto } from '~/data/gallery-photos'
import { buildCloudinaryImageUrl, GUEST_PHOTO_LARGE_WIDTH_PX, GUEST_PHOTO_THUMBNAIL_WIDTH_PX } from '~/utils/cloudinary-image-url'
import { getGuestDisplayName } from '~/utils/guest-display-name'

const openPhotoIndex = ref<number | null>(null)
// New photos arrive at the front of the list, which would swap the photo under an open lightbox
const isLightboxOpen = computed(() => openPhotoIndex.value !== null)
const { photos } = useGuestPhotos()
useGuestPhotosAutoRefresh(isLightboxOpen)
const cloudName = useRuntimeConfig().public.cloudinaryCloudName

const galleryPhotos = computed<GalleryPhoto[]>(() =>
  photos.value.map(photo => ({
    src: buildCloudinaryImageUrl(cloudName, photo, GUEST_PHOTO_LARGE_WIDTH_PX),
    thumbnailSrc: buildCloudinaryImageUrl(cloudName, photo, GUEST_PHOTO_THUMBNAIL_WIDTH_PX),
    alt: `รูปจาก${getGuestDisplayName(photo)}`,
  })),
)
</script>
