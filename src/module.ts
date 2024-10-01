import { fileURLToPath } from 'node:url'
import { defineNuxtModule, addPlugin, createResolver, addServerHandler } from '@nuxt/kit'

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
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

    if (!options.baseUrl) {
      await nuxt.close()
      throw new Error('baseUrl required')
    }

    if (!options.dbName) {
      await nuxt.close()
      throw new Error('dbName required')
    }

    nuxt.options.runtimeConfig.public.odooBaseUrl = options.baseUrl
    nuxt.options.runtimeConfig.public.odooDbName = options.dbName

    addServerHandler({
      route: '/api/odoo/login',
      handler: resolve(runtimeDir, 'server/api/odoo/login'),
    })

    addServerHandler({
      route: '/api/odoo/call',
      handler: resolve(runtimeDir, 'server/api/odoo/call'),
    })

    addServerHandler({
      route: '/api/odoo/create',
      handler: resolve(runtimeDir, 'server/api/odoo/create'),
    })

    addServerHandler({
      route: '/api/odoo/fieldsGet',
      handler: resolve(runtimeDir, 'server/api/odoo/fieldsGet'),
    })

    addServerHandler({
      route: '/api/odoo/isLoggedIn',
      handler: resolve(runtimeDir, 'server/api/odoo/isLoggedIn'),
    })

    addServerHandler({
      route: '/api/odoo/logout',
      handler: resolve(runtimeDir, 'server/api/odoo/logout'),
    })

    addServerHandler({
      route: '/api/odoo/read',
      handler: resolve(runtimeDir, 'server/api/odoo/read'),
    })

    addServerHandler({
      route: '/api/odoo/readGroup',
      handler: resolve(runtimeDir, 'server/api/odoo/readGroup'),
    })

    addServerHandler({
      route: '/api/odoo/search',
      handler: resolve(runtimeDir, 'server/api/odoo/search'),
    })

    addServerHandler({
      route: '/api/odoo/searchCount',
      handler: resolve(runtimeDir, 'server/api/odoo/searchCount'),
    })

    addServerHandler({
      route: '/api/odoo/searchRead',
      handler: resolve(runtimeDir, 'server/api/odoo/searchRead'),
    })

    addServerHandler({
      route: '/api/odoo/sendSession',
      handler: resolve(runtimeDir, 'server/api/odoo/sendSession'),
    })

    addServerHandler({
      route: '/api/odoo/unlink',
      handler: resolve(runtimeDir, 'server/api/odoo/unlink'),
    })

    addServerHandler({
      route: '/api/odoo/write',
      handler: resolve(runtimeDir, 'server/api/odoo/write'),
    })

    // Aggiungi il plugin
    nuxt.options.build.transpile.push(runtimeDir)
    addPlugin(resolve('./runtime/plugin'))
  },
})
