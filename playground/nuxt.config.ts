export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },

  odooRpc: {
    baseUrl: process.env.BASE_URL,
    dbName: process.env.DB_NAME,
  },

  compatibilityDate: '2024-09-30',
})
