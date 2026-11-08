import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['lenis/nuxt'],
  css: ['lenis/dist/lenis.css', '~/assets/css/main.css'],
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
