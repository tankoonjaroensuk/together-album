<template>
  <footer class="border-t border-white/5 px-6 py-12 text-center">
    <rings-icon class="mx-auto h-5 w-9 text-rose/70" />
    <p class="mt-4 text-sm text-champagne/80 sm:text-base">ขอบคุณที่มาร่วมเป็นส่วนหนึ่งในวันสำคัญของเรา</p>
    <div class="mt-6 flex items-center justify-center gap-3">
      <span class="h-px w-10 bg-rose/30" aria-hidden="true" />
      <span class="font-mono text-xs uppercase tracking-[0.3em] text-rose">with all our love</span>
      <span class="h-px w-10 bg-rose/30" aria-hidden="true" />
    </div>
    <p class="mt-2 font-heading text-3xl text-champagne">{{ coupleNames }}</p>
    <p class="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-taupe">{{ eventDateLabel }}</p>
  </footer>
</template>

<script setup lang="ts">
const { coupleNames, eventDateLabel } = useAppConfig().wedding
</script>
