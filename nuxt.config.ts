import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['lenis/nuxt'],
  css: ['lenis/dist/lenis.css', '~/assets/css/main.css'],
  app: {
    // Tells screen readers to read Thai and browsers to break lines between Thai words
    head: { htmlAttrs: { lang: 'th' } },
  },
  // Filled from NUXT_* environment variables, see .env.example
  runtimeConfig: {
    cloudinaryApiKey: '',
    cloudinaryApiSecret: '',
    cloudinaryFolder: 'together-album/dev',
    uploadsEnabled: true,
    public: {
      cloudinaryCloudName: '',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
