<template>
  <section aria-labelledby="hero-heading" class="px-2 sm:px-3">
    <!-- Leaves the navbar plus 6.25rem (the upper half of the text on the seam) of the first screen so the names,
         date and subtitle are visible on first load at any screen height; the upload button peeks just below the fold -->
    <div class="h-[calc(100svh-var(--navbar-height)-6.25rem)] pt-2 sm:pt-3">
      <div class="relative h-full overflow-hidden rounded-xl sm:rounded-2xl">
        <picture>
          <source media="(min-width: 768px)" srcset="/c245a84a0f1637ace453c3ca95c3f303.jpg">
          <img
            src="/c7cb5cc24db5a95fe08d85b2c956d1c2.jpg"
            :alt="`รูปภาพวันแต่งงานของ ${coupleNames}`"
            class="absolute inset-0 h-full w-full object-cover"
            fetchpriority="high"
          >
        </picture>
        <div class="absolute inset-0 bg-black/25" aria-hidden="true" />
        <div
          class="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-b from-transparent via-ink/60 to-ink"
          aria-hidden="true"
        />
      </div>
    </div>

    <!-- Zero-height anchor at the seam; the content is pulled up by half its own height so it straddles both fades -->
    <div class="relative z-10 h-0">
      <div class="hero-content absolute inset-x-0 top-0 flex -translate-y-1/2 flex-col items-center px-6 text-center text-white">
        <rings-icon class="h-7 w-12" />

        <p class="mt-4 max-w-xs text-sm text-white/85 sm:max-w-md sm:text-base">
          ช่วยแชร์ภาพ <em>(ความประทับใจ)</em> ที่คุณถ่ายไว้ให้เราด้วยนะ
        </p>

        <!-- Opens the page the way "with all our love" closes it in the footer -->
        <div class="mt-6 flex items-center justify-center gap-3">
          <span class="h-px w-10 bg-white/30" aria-hidden="true" />
          <span class="font-mono text-xs uppercase tracking-[0.3em] text-white/85">the wedding of</span>
          <span class="h-px w-10 bg-white/30" aria-hidden="true" />
        </div>

        <h1 id="hero-heading" class="mt-2 font-heading text-5xl leading-tight sm:text-7xl">
          {{ coupleNames }}
        </h1>

        <p class="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-white/85 sm:text-sm">
          {{ eventDateLabel }}
        </p>

        <a
          href="#upload"
          class="mt-7 rounded-md bg-white/10 px-4 py-2 font-mono text-sm text-white/90 ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
        >
          อัปโหลดรูปภาพ ↓
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
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
