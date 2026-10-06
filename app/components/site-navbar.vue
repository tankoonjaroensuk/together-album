<template>
  <header class="sticky top-0 z-20 border-b border-white/5 bg-ink/80 backdrop-blur-md">
    <div class="mx-auto flex max-w-xl items-center justify-center h-(--navbar-height) px-6">
      <span class="font-heading text-2xl text-champagne">{{ coupleNames }}</span>
    </div>
  </header>
</template>

<script setup lang="ts">
const { coupleNames } = useAppConfig().wedding
</script>
