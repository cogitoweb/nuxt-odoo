import odooService from './utils/odooService'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((_nuxtApp) => {
  return {
    provide: {
      odoo: odooService,
    },
  }
})
