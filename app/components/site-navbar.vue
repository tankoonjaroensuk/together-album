<template>
  <!-- The bar stays clear while the big names under the hero photo are on screen, then fills in once they scroll away -->
  <header
    class="sticky top-0 z-20 border-b transition-colors duration-500"
    :class="isHeroNameVisible ? 'border-transparent bg-ivory' : 'border-charcoal/10 bg-ivory/80 backdrop-blur-md'"
  >
    <div class="mx-auto flex max-w-xl items-center justify-center h-(--navbar-height) px-6">
      <span
        class="font-heading text-xl italic text-charcoal transition duration-500"
        :class="isHeroNameVisible ? 'translate-y-1 opacity-0' : 'opacity-100'"
        :aria-hidden="isHeroNameVisible || undefined"
      >
        {{ coupleNames }}
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
const { coupleNames } = useAppConfig().wedding

const isHeroNameVisible = ref(true)
let heroNameObserver: IntersectionObserver | undefined

onMounted(() => {
  const heroHeading = document.getElementById('hero-heading')
  if (!heroHeading) {
    isHeroNameVisible.value = false
    return
  }
  // The top margin keeps the names counted as hidden once they slide under the bar itself
  const navbarHeightPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) * 16
  heroNameObserver = new IntersectionObserver(([entry]) => {
    isHeroNameVisible.value = entry?.isIntersecting ?? false
  }, { rootMargin: `-${navbarHeightPx}px 0px 0px 0px` })
  heroNameObserver.observe(heroHeading)
})

onBeforeUnmount(() => heroNameObserver?.disconnect())
</script>
