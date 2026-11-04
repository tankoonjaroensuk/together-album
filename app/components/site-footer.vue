<template>
  <footer class="border-t border-charcoal/10 px-6 py-12 text-center">
    <rings-icon class="mx-auto h-5 w-9 text-gold" />
    <p class="mt-4 text-sm text-charcoal/80 sm:text-base">ขอบคุณที่มาร่วมเป็นส่วนหนึ่งในวันสำคัญของเรา</p>
    <p class="mt-6 font-heading text-3xl italic text-charcoal">{{ coupleNames }}</p>
    <p class="mt-1 font-heading text-lg text-taupe">{{ eventDateLabel }}</p>
  </footer>
</template>

<script setup lang="ts">
const { coupleNames, eventDateLabel } = useAppConfig().wedding
</script>
