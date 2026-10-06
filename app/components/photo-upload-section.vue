<template>
  <section id="upload" class="relative overflow-hidden">
    <div class="rose-glow pointer-events-none absolute inset-x-0 top-0 h-96" aria-hidden="true" />

    <div class="relative mx-auto max-w-xl px-6 py-20 sm:py-28">
      <div class="text-center">
        <p class="font-mono text-xs uppercase tracking-[0.3em] text-rose">share your moments</p>
        <h2 class="mt-4 font-heading text-3xl leading-snug text-champagne sm:text-4xl">
          ร่วมแชร์ภาพความทรงจำ
        </h2>
        <div class="mt-5 flex items-center justify-center gap-3" aria-hidden="true">
          <span class="h-px w-12 bg-rose/30" />
          <rings-icon class="h-3.5 w-6 text-rose/70" />
          <span class="h-px w-12 bg-rose/30" />
        </div>
        <p class="mt-5 text-sm leading-relaxed text-taupe sm:text-base">
          เลือกรูปจากมือถือหรือถ่ายสดๆ ได้เลย เราจะรวบรวมทุกภาพไว้ในอัลบั้มของเรา
        </p>
      </div>

      <label for="photo-input"
        class="mt-10 flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border border-dashed border-champagne/25 bg-white/3 px-6 py-10 text-center transition hover:border-rose/50 hover:bg-white/5 active:scale-[0.98]">
        <span class="flex h-14 w-14 items-center justify-center rounded-full bg-rose/15 text-rose">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
            aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.174C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.174 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-6.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316ZM16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
          </svg>
        </span>
        <span class="text-base font-semibold text-champagne sm:text-lg">ถ่ายรูปหรือเลือกจากคลังภาพ</span>
        <span class="text-xs text-taupe">เลือกได้หลายรูปพร้อมกัน</span>
        <input id="photo-input" type="file" accept="image/*" multiple class="sr-only" @change="addPhotosFromFileInput">
      </label>

      <ul v-if="selectedPhotos.length" class="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
        <li v-for="photo in selectedPhotos" :key="photo.id"
          class="relative aspect-square overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
          <img :src="photo.previewUrl" :alt="photo.file.name" class="h-full w-full object-cover">
          <button type="button"
            class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white backdrop-blur-sm"
            :aria-label="`ลบรูป ${photo.file.name}`" @click="removeSelectedPhoto(photo.id)">
            ✕
          </button>
        </li>
      </ul>

      <button v-if="selectedPhotos.length" type="button"
        class="mt-6 w-full rounded-full bg-champagne px-6 py-3 text-sm font-semibold text-ink shadow-lg shadow-black/40 transition hover:bg-champagne/90 disabled:cursor-not-allowed disabled:bg-champagne/30 active:scale-[0.98] sm:text-base"
        :disabled="isUploading" @click="uploadSelectedPhotos">
        {{ uploadButtonLabel }}
      </button>

      <p v-if="uploadStatusMessage" class="mt-4 text-center text-sm text-rose">
        {{ uploadStatusMessage }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
interface SelectedPhoto {
  id: string
  file: File
  previewUrl: string
}

const SIMULATED_UPLOAD_DELAY_MS = 1200

const selectedPhotos = ref<SelectedPhoto[]>([])
const isUploading = ref(false)
const uploadStatusMessage = ref('')

const uploadButtonLabel = computed(() => {
  if (isUploading.value) return 'กำลังอัปโหลด...'
  return `อัปโหลด ${selectedPhotos.value.length} รูป`
})

function addPhotosFromFileInput(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []

  for (const file of files) {
    selectedPhotos.value.push({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    })
  }
  input.value = ''
}

function removeSelectedPhoto(photoId: string) {
  const photo = selectedPhotos.value.find(selectedPhoto => selectedPhoto.id === photoId)
  if (photo) URL.revokeObjectURL(photo.previewUrl)
  selectedPhotos.value = selectedPhotos.value.filter(selectedPhoto => selectedPhoto.id !== photoId)
}

async function uploadSelectedPhotos() {
  const photosToUpload = [...selectedPhotos.value]
  isUploading.value = true
  uploadStatusMessage.value = ''

  try {
    await new Promise(resolve => setTimeout(resolve, SIMULATED_UPLOAD_DELAY_MS))
    uploadStatusMessage.value = `อัปโหลดสำเร็จ ${photosToUpload.length} รูป ขอบคุณมากๆ เลยนะ`
    photosToUpload.forEach(photo => removeSelectedPhoto(photo.id))
  } catch {
    uploadStatusMessage.value = 'อัปโหลดไม่สำเร็จ ลองใหม่อีกครั้งนะ'
  } finally {
    isUploading.value = false
  }
}

</script>

<style scoped>
.rose-glow {
  background-image: radial-gradient(ellipse at top, color-mix(in srgb, var(--color-rose) 14%, transparent), transparent 65%);
}
</style>
