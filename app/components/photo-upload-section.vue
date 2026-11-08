<template>
  <!-- The scroll margin keeps an anchor jump from landing under the sticky navbar -->
  <section id="upload" class="scroll-mt-(--navbar-height)">
    <div class="mx-auto max-w-xl px-6 pt-10 text-center">
      <h2 class="font-heading text-3xl leading-snug text-charcoal sm:text-4xl">
        ร่วมแชร์ภาพความทรงจำ
      </h2>
      <p class="mt-2 text-taupe">แตะรูปเปล่าเพื่อถ่ายหรือเลือกรูปจากคลังภาพ เลือกได้หลายรูปพร้อมกัน</p>
    </div>

    <!-- Outside the padded column so the string runs edge to edge -->
    <polaroid-line-carousel class="mt-4" :photos="carouselPhotos" @retry="retryPhoto">
      <template #add-card>
        <label for="photo-input" class="block cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gold">
          <span class="flex aspect-square items-center justify-center bg-charcoal/5 text-silver">
            <camera-icon class="size-12" />
          </span>
          <span class="flex h-11 items-center justify-center text-sm font-semibold text-charcoal">
            {{ hasSelectedPhotos ? 'เพิ่มอีก' : 'เพิ่มรูป' }}
          </span>
          <input
            id="photo-input"
            type="file"
            accept="image/*"
            multiple
            class="sr-only"
            @change="addPhotosFromFileInput"
          >
        </label>
      </template>
    </polaroid-line-carousel>

    <div v-if="unsentPhotos.length" class="mx-auto max-w-xl px-6">
      <label class="block">
        <span class="text-sm text-taupe">ชื่อของคุณ (ไม่บังคับ)</span>
        <!-- 16px text stops iOS from zooming the page when the field is focused -->
        <input
          v-model="guestName"
          type="text"
          autocomplete="name"
          maxlength="60"
          placeholder="เช่น น้องมายด์"
          class="mt-1 block min-h-12 w-full rounded-lg bg-white px-4 text-base text-charcoal ring-1 ring-silver/60 placeholder:text-silver focus:outline-2 focus:outline-gold"
        >
      </label>

      <button
        type="button"
        class="mt-4 w-full rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-ivory shadow-lg shadow-charcoal/20 transition hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:bg-charcoal/30 active:scale-[0.98] sm:text-base"
        :disabled="isUploading"
        @click="uploadUnsentPhotos"
      >
        {{ uploadButtonLabel }}
      </button>
    </div>

    <div class="mx-auto max-w-xl px-6 pb-16 text-center sm:pb-24">
      <p v-if="uploadedPhotoCount && !unsentPhotos.length" class="text-charcoal">
        ส่งแล้ว {{ uploadedPhotoCount }} รูป ขอบคุณมากนะ
        <span class="block text-sm text-taupe">มีรูปอีกไหม แตะรูปเปล่าบนเชือกเพื่อส่งเพิ่มได้เลย</span>
      </p>
      <!-- The guest gallery sits below the couple's photos, a long scroll away on a phone -->
      <a
        v-if="guestPhotos.length"
        href="#guest-photos"
        class="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-charcoal underline decoration-gold decoration-2 underline-offset-4"
      >
        ดูรูปจากแขกทั้งหมด {{ guestPhotos.length }} รูป
        <span aria-hidden="true">↓</span>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CarouselPhoto } from '~/components/polaroid-line-carousel.vue'
import { lightboxPhotos } from '~/data/gallery-photos'
import { buildCloudinaryImageUrl, GUEST_PHOTO_THUMBNAIL_WIDTH_PX } from '~/utils/cloudinary-image-url'
import { getGuestDisplayName } from '~/utils/guest-display-name'

const {
  selectedPhotos,
  guestName,
  unsentPhotos,
  isUploading,
  uploadButtonLabel,
  addPhotos,
  uploadUnsentPhotos,
  retryPhoto,
} = usePhotoUpload()

// Every print on the string is simulated each frame, so it holds only the latest guest photos; the gallery below has them all
const MAX_GUEST_PRINTS_ON_STRING = 30

const { photos: guestPhotos } = useGuestPhotos()
const cloudName = useRuntimeConfig().public.cloudinaryCloudName

const hasSelectedPhotos = computed(() => selectedPhotos.value.length > 0)
const uploadedPhotoCount = computed(() => selectedPhotos.value.filter(photo => photo.status === 'uploaded').length)

// The visitor's own photos first, newest beside the empty print, then the latest photos from everyone else
const carouselPhotos = computed<CarouselPhoto[]>(() => {
  const ownPhotos = selectedPhotos.value
    .map(photo => ({ id: photo.id, src: photo.previewUrl, alt: photo.file.name, status: photo.status, progress: photo.progress }))
    .reverse()

  const ownPublicIds = new Set(selectedPhotos.value.map(photo => photo.publicId))
  const otherGuestPhotos = guestPhotos.value
    .filter(photo => !ownPublicIds.has(photo.publicId))
    .slice(0, MAX_GUEST_PRINTS_ON_STRING)
    .map(photo => ({
      id: photo.publicId,
      src: buildCloudinaryImageUrl(cloudName, photo, GUEST_PHOTO_THUMBNAIL_WIDTH_PX),
      alt: `รูปจาก${getGuestDisplayName(photo)}`,
      caption: `จาก ${getGuestDisplayName(photo)}`,
    }))

  return [...ownPhotos, ...otherGuestPhotos]
})

// Development shortcut: /?mock=5 adds that many gallery photos as if a guest had picked them, to preview the string
onMounted(async () => {
  if (!import.meta.dev) return
  const mockPhotoCount = Number(useRoute().query.mock)
  if (!mockPhotoCount) return

  const mockFiles = await Promise.all(
    lightboxPhotos.slice(0, mockPhotoCount).map(async (photo, index) => {
      const imageBlob = await (await fetch(photo.src)).blob()
      return new File([imageBlob], `mock-${index + 1}.jpg`, { type: imageBlob.type })
    }),
  )
  await addPhotos(mockFiles)
})

function addPhotosFromFileInput(event: Event) {
  const input = event.target as HTMLInputElement
  addPhotos(input.files ? Array.from(input.files) : [])
  // Clearing the input lets the same file be picked again after it was removed
  input.value = ''
}
</script>
