import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

export interface ModuleOptions {
  baseUrl?: string
  dbName?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-odoo',
    configKey: 'odooRpc',
  },
  defaults: {
    baseUrl: '',
    dbName: '',
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    if (!options.baseUrl) {
      await nuxt.close()
      throw new Error('baseUrl required')
    }

    if (!options.dbName) {
      await nuxt.close()
      throw new Error('dbName required')
    }

    nuxt.options.runtimeConfig.public.odooBaseUrl = options.baseUrl

    // Aggiungi il plugin
    addPlugin(resolve('./runtime/plugin'))
  },
})
