<template>
  <section aria-label="ความทรงจำของเรา" class="px-2 pb-2 sm:px-3 sm:pb-3">
    <!-- isolate keeps the fade overlay below the hero names that hang over the top of the grid -->
    <div class="relative isolate grid grid-cols-2 gap-2 md:grid-cols-3">
      <!-- Mirrors the hero's bottom fade so the photos emerge from the same ink the hero dissolves into -->
      <div
        class="pointer-events-none absolute inset-x-0 top-0 z-10 h-[40svh] bg-linear-to-b from-ink via-ink/60 to-transparent"
        aria-hidden="true"
      />

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
import type { GalleryPhoto } from '~/types/gallery-photo'

const leftColumnPhotos: GalleryPhoto[] = [
  {
    src: '/0a165f75df758ba34e2d495aefbd9277.jpg',
    alt: 'เจ้าบ่าวเจ้าสาวยืนชิดกันริมทะเลสาบยามเย็น',
  },
  {
    src: '/c245a84a0f1637ace453c3ca95c3f303.jpg',
    alt: 'เจ้าบ่าวเจ้าสาวจับมือกันริมทะเลสาบตอนพระอาทิตย์ตก',
  },
  {
    src: '/a34a8416bbde5f17b32ab4a0d43024c0.jpg',
    alt: 'เจ้าสาวกอดเจ้าบ่าวจากด้านหลังริมทะเลสาบ',
  },
]

const featuredPhoto: GalleryPhoto = {
  src: '/38befbc449ad88f4f6dd39b51e508bcc.jpg',
  alt: 'เจ้าสาวถือช่อกุหลาบแดงยิ้มให้เจ้าบ่าวบนสนามหญ้า',
}

const rightColumnPhotos: GalleryPhoto[] = [
  {
    src: '/aec1bc6b786ebcb1afaaaaaed45979ed.jpg',
    alt: 'เจ้าบ่าวเจ้าสาวจับมือกันบนสนามหญ้าริมทะเลสาบ',
  },
  {
    src: '/a950c04f80b6396ef6dcb616b46715a3.jpg',
    alt: 'ภาพขาวดำเจ้าบ่าวเจ้าสาวจูงมือกันเดินบนสนามหญ้า',
  },
  {
    src: '/c7cb5cc24db5a95fe08d85b2c956d1c2.jpg',
    alt: 'เจ้าบ่าวเจ้าสาวยืนคู่กันริมทะเลสาบ เจ้าสาวสวมผ้าคลุมหน้า',
  },
]

// Featured first because it is the first photo phones show; arrows in the lightbox follow this order
const lightboxPhotos: GalleryPhoto[] = [featuredPhoto, ...leftColumnPhotos, ...rightColumnPhotos]

const openPhotoIndex = ref<number | null>(null)

function openLightbox(photo: GalleryPhoto) {
  openPhotoIndex.value = lightboxPhotos.indexOf(photo)
}
</script>
