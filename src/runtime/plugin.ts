import odooService from './utils/odooService'
import { initOdoo } from './server/utils/odooInstance'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin((_nuxtApp) => {
  const config = useRuntimeConfig()
  initOdoo(config.public.odooBaseUrl as string)

  return {
    provide: {
      odoo: odooService,
    },
  }
})
