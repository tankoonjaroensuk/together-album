<template>
  <div class="flex min-h-screen flex-col">
    <vue-lenis root :options="{ anchors: true }" />
    <site-navbar />
    <main class="flex-1">
      <nuxt-page />
    </main>
    <site-footer />
    <app-toast />
  </div>
</template>

<script setup lang="ts">
import { heroPhotoSrc } from '~/data/gallery-photos'

const { coupleNames, eventDateLabel } = useAppConfig().wedding
const pageTitle = `${coupleNames} · ร่วมแชร์ภาพความทรงจำ`
const pageDescription = `ร่วมแชร์รูปจากงานแต่งงานของ ${coupleNames} วันที่ ${eventDateLabel}`
// Link previews in LINE and Facebook only load an absolute image URL; the landscape photo fits their wide preview card
const previewImageUrl = `${useRequestURL().origin}${heroPhotoSrc}`

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogImage: previewImageUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})
</script>
