<template>
  <section aria-labelledby="gallery-heading" class="px-2 pb-2 sm:px-3 sm:pb-3">
    <h2 id="gallery-heading" class="px-4 pb-4 text-center font-heading text-2xl text-charcoal sm:text-3xl">
      ภาพของเรา
    </h2>
    <div class="grid grid-cols-2 gap-2 md:grid-cols-3">
      <div class="flex flex-col gap-2">
        <gallery-photo-button
          v-for="photo in leftColumnPhotos"
          :key="photo.src"
          :photo="photo"
          class="aspect-2/3"
          @click="openLightbox(photo)"
        />
      </div>

      <!-- On phones the featured photo sits above both columns; from md up it stays pinned below the sticky navbar -->
      <gallery-photo-button
        :photo="featuredPhoto"
        class="order-first col-span-2 h-[75svh] md:sticky md:top-[calc(var(--navbar-height)+0.75rem)] md:order-0 md:col-span-1 md:h-[calc(100svh-var(--navbar-height)-1.25rem)]"
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

function openLightbox(photo: GalleryPhoto) {
  openPhotoIndex.value = lightboxPhotos.indexOf(photo)
}
</script>
