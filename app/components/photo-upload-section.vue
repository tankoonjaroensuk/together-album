<template>
  <section id="upload">
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

    <div v-if="unsentPhotos.length" class="mx-auto max-w-xl px-6 pb-16 sm:pb-24">
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
    <div v-else class="pb-16 sm:pb-24" />
  </section>
</template>

<script setup lang="ts">
import { lightboxPhotos } from '~/data/gallery-photos'

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

const hasSelectedPhotos = computed(() => selectedPhotos.value.length > 0)

// Newest first, so the latest photo hangs right beside the empty print used to add more
const carouselPhotos = computed(() =>
  selectedPhotos.value
    .map(photo => ({ id: photo.id, src: photo.previewUrl, alt: photo.file.name, status: photo.status, progress: photo.progress }))
    .reverse(),
)

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
