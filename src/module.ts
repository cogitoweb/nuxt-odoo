import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

export interface ModuleOptions {
  baseUrl?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-odoo-rpc',
    configKey: 'odooRpc',
  },
  defaults: {
    baseUrl: '',
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.public.odooBaseUrl = options.baseUrl

    // Aggiungi il plugin
    addPlugin(resolve('./runtime/plugin'))
  },
})
