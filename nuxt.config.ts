// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  app: {
    head: {
      title: 'Font comparer',

      bodyAttrs: {
        class: 'bg-slate-800 text-slate-400',
      },
    },
  },
});
