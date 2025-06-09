/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRuntimeConfig } from '#app'

const odooService = {
  // Metodo per determinare se usare API dirette o server handlers
  _shouldUseDirectApi(): boolean {
    const config = useRuntimeConfig()
    return config.public.odooIsStatic as boolean
  },

  // Metodo per chiamate dirette a Odoo (modalità statica)
  _callOdooDirect: async (method: string, params: any) => {
    const config = useRuntimeConfig()
    
    return await $fetch('/jsonrpc', {
      method: 'POST',
      baseURL: config.public.odooBaseUrl as string,
      body: {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: method,
          args: params
        },
        id: Math.floor(Math.random() * 1000000)
      }
    })
  },

  // Metodo per login diretto (modalità statica)
  _loginDirect: async (db: string, username: string, password: string) => {
    const config = useRuntimeConfig()
    
    const response = await $fetch('/jsonrpc', {
      method: 'POST',
      baseURL: config.public.odooBaseUrl as string,
      body: {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'common',
          method: 'authenticate',
          args: [db, username, password, {}]
        },
        id: Math.floor(Math.random() * 1000000)
      }
    }) as any

    return response.result
  },

  callOdoo: async (endpoint: string, params: any = {}, headers: any = {}) => {
    const shouldUseDirectApi = odooService._shouldUseDirectApi()
    
    if (shouldUseDirectApi) {
      // Modalità statica: chiamata diretta a Odoo
      switch (endpoint) {
        case 'login':
          return await odooService._loginDirect(params.db, params.username, params.password)
        case 'searchRead':
          return await odooService._callOdooDirect('search_read', [params.model, params.domain || [], params.fields || [], params.offset || 0, params.limit || 0, params.order || ''])
        case 'call':
          return await odooService._callOdooDirect('execute_kw', [params.db, params.uid, params.password, params.model, params.method, params.args || [], params.kwargs || {}])
        case 'create':
          return await odooService._callOdooDirect('create', [params.model, params.data])
        case 'read':
          return await odooService._callOdooDirect('read', [params.model, Array.isArray(params.ids) ? params.ids : [params.ids], params.fields || []])
        case 'write':
          return await odooService._callOdooDirect('write', [params.model, Array.isArray(params.ids) ? params.ids : [params.ids], params.data])
        case 'unlink':
          return await odooService._callOdooDirect('unlink', [params.model, Array.isArray(params.ids) ? params.ids : [params.ids]])
        case 'search':
          return await odooService._callOdooDirect('search', [params.model, params.domain || [], params.offset || 0, params.limit || 0, params.order || ''])
        case 'searchCount':
          return await odooService._callOdooDirect('search_count', [params.model, params.domain || []])
        case 'fieldsGet':
          return await odooService._callOdooDirect('fields_get', [params.model, params.fields || [], params.attributes || []])
        default:
          throw new Error(`Endpoint ${endpoint} non supportato in modalità statica`)
      }
    } else {
      // Modalità standard: usa i server handlers
      try {
        const response = await $fetch(`/api/odoo/${endpoint}`, {
          method: 'POST',
          body: params,
          headers: headers,
        })
        return response
      }
      catch (error) {
        throw error
      }
    }
  },

  login: async (db: string, username: string, password: string) =>
    await odooService.callOdoo('login', { db, username, password }),
  isLoggedIn: async () =>
    await odooService.callOdoo('isLoggedIn'),
  logout: async () =>
    await odooService.callOdoo('logout'),
  searchRead: async (model: string, params: any) =>
    await odooService.callOdoo('searchRead', { model, ...params }),
  call: async (model: string, method: string, args: any[], kwargs: any) =>
    await odooService.callOdoo('call', { model, method, args, kwargs }),
  create: async (model: string, data: any, params: any) =>
    await odooService.callOdoo('create', { model, data, ...params }),
  fieldsGet: async (model: string, params: any) =>
    await odooService.callOdoo('fieldsGet', { model, ...params }),
  read: async (model: string, ids: number | number[], params: any) =>
    await odooService.callOdoo('read', { model, ids, ...params }),
  readGroup: async (model: string, args: any[], kwargs: any) =>
    await odooService.callOdoo('readGroup', { model, args, kwargs }),
  search: async (model: string, params: any) =>
    await odooService.callOdoo('search', { model, ...params }),
  searchCount: async (model: string, params: any) =>
    await odooService.callOdoo('searchCount', { model, ...params }),
  unlink: async (model: string, ids: number | number[], params: any) =>
    await odooService.callOdoo('unlink', { model, ids, ...params }),
  write: async (model: string, ids: number | number[], data: any, params: any) =>
    await odooService.callOdoo('write', { model, ids, data, ...params }),
  sendSession: async (sessionId: string) =>
    await odooService.callOdoo('sendSession', {}, { session_id: sessionId }),
}

export default odooService