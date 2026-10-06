<template>
  <!-- Size and grid placement come from the parent through the class attribute -->
  <button
    type="button"
    class="group cursor-zoom-in overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
  >
    <img
      :src="photo.src"
      :alt="photo.alt"
      class="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
      loading="lazy"
      decoding="async"
    >
  </button>
</template>

<script setup lang="ts">
import type { GalleryPhoto } from '~/types/gallery-photo'

defineProps<{ photo: GalleryPhoto }>()
</script>
