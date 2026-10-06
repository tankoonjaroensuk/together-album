<template>
  <div class="flex min-h-screen flex-col">
    <vue-lenis root :options="{ anchors: true }" />
    <site-navbar />
    <main class="flex-1">
      <nuxt-page />
    </main>
    <site-footer />
  </div>
</template>
