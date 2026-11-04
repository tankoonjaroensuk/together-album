<template>
  <section aria-labelledby="hero-heading" class="px-2 sm:px-3">
    <!-- The text sits below the photo instead of over it, so the couple stay clear; the photo leaves room on the first
         screen for the string with the empty print to peek in, because guests arrive here from a QR code to upload -->
    <div class="h-[calc(100svh-var(--navbar-height)-26rem)] min-h-56 pt-2 sm:pt-3">
      <picture>
        <source media="(min-width: 768px)" :srcset="heroPhotoDesktopSrc">
        <img
          :src="heroPhotoMobileSrc"
          :alt="`รูปภาพวันแต่งงานของ ${coupleNames}`"
          class="size-full rounded-xl object-cover sm:rounded-2xl"
          fetchpriority="high"
        >
      </picture>
    </div>

    <div class="hero-content flex flex-col items-center px-6 pt-7 text-center">
      <rings-icon class="h-6 w-10 text-gold" />

      <h1 id="hero-heading" class="mt-3 font-heading text-4xl italic leading-tight sm:text-7xl">
        {{ coupleNames }}
      </h1>

      <p class="mt-1 font-heading text-xl text-taupe sm:text-2xl">
        {{ eventDateLabel }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { heroPhotoDesktopSrc, heroPhotoMobileSrc } from '~/data/gallery-photos'

const { coupleNames, eventDateLabel } = useAppConfig().wedding
</script>

<style scoped>
.hero-content {
  animation: rise-in 1s ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .hero-content {
    animation: none;
  }
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}
</style>
