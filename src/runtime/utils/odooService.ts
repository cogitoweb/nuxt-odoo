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
    
    const response = await $fetch('/jsonrpc', {
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
    }) as any

    return response.result
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

  // Session state per modalità statica
  _session: {
    uid: null as number | null,
    db: null as string | null,
    password: null as string | null,
  },

  callOdoo: async (endpoint: string, params: any = {}, headers: any = {}) => {
    const shouldUseDirectApi = odooService._shouldUseDirectApi()
    
    if (shouldUseDirectApi) {
      // Modalità statica: chiamata diretta a Odoo
      const config = useRuntimeConfig()
      
      switch (endpoint) {
        case 'login':
          const uid = await odooService._loginDirect(params.db, params.username, params.password)
          // Salva la sessione per le chiamate successive
          odooService._session.uid = uid
          odooService._session.db = params.db
          odooService._session.password = params.password
          return uid

        case 'isLoggedIn':
          return odooService._session.uid !== null

        case 'logout':
          odooService._session.uid = null
          odooService._session.db = null
          odooService._session.password = null
          return true

        case 'searchRead':
          if (!odooService._session.uid) throw new Error('Non autenticato')
          return await odooService._callOdooDirect('execute_kw', [
            odooService._session.db,
            odooService._session.uid,
            odooService._session.password,
            params.model,
            'search_read',
            [params.domain || []],
            {
              fields: params.fields || [],
              offset: params.offset || 0,
              limit: params.limit || 0,
              order: params.order || ''
            }
          ])

        case 'call':
          if (!odooService._session.uid) throw new Error('Non autenticato')
          return await odooService._callOdooDirect('execute_kw', [
            odooService._session.db,
            odooService._session.uid,
            odooService._session.password,
            params.model,
            params.method,
            params.args || [],
            params.kwargs || {}
          ])

        case 'create':
          if (!odooService._session.uid) throw new Error('Non autenticato')
          return await odooService._callOdooDirect('execute_kw', [
            odooService._session.db,
            odooService._session.uid,
            odooService._session.password,
            params.model,
            'create',
            [params.data]
          ])

        case 'read':
          if (!odooService._session.uid) throw new Error('Non autenticato')
          return await odooService._callOdooDirect('execute_kw', [
            odooService._session.db,
            odooService._session.uid,
            odooService._session.password,
            params.model,
            'read',
            [Array.isArray(params.ids) ? params.ids : [params.ids]],
            { fields: params.fields || [] }
          ])

        case 'write':
          if (!odooService._session.uid) throw new Error('Non autenticato')
          return await odooService._callOdooDirect('execute_kw', [
            odooService._session.db,
            odooService._session.uid,
            odooService._session.password,
            params.model,
            'write',
            [Array.isArray(params.ids) ? params.ids : [params.ids], params.data]
          ])

        case 'unlink':
          if (!odooService._session.uid) throw new Error('Non autenticato')
          return await odooService._callOdooDirect('execute_kw', [
            odooService._session.db,
            odooService._session.uid,
            odooService._session.password,
            params.model,
            'unlink',
            [Array.isArray(params.ids) ? params.ids : [params.ids]]
          ])

        case 'search':
          if (!odooService._session.uid) throw new Error('Non autenticato')
          return await odooService._callOdooDirect('execute_kw', [
            odooService._session.db,
            odooService._session.uid,
            odooService._session.password,
            params.model,
            'search',
            [params.domain || []],
            {
              offset: params.offset || 0,
              limit: params.limit || 0,
              order: params.order || ''
            }
          ])

        case 'searchCount':
          if (!odooService._session.uid) throw new Error('Non autenticato')
          return await odooService._callOdooDirect('execute_kw', [
            odooService._session.db,
            odooService._session.uid,
            odooService._session.password,
            params.model,
            'search_count',
            [params.domain || []]
          ])

        case 'fieldsGet':
          if (!odooService._session.uid) throw new Error('Non autenticato')
          return await odooService._callOdooDirect('execute_kw', [
            odooService._session.db,
            odooService._session.uid,
            odooService._session.password,
            params.model,
            'fields_get',
            [],
            {
              attributes: params.attributes || []
            }
          ])

        case 'readGroup':
          if (!odooService._session.uid) throw new Error('Non autenticato')
          return await odooService._callOdooDirect('execute_kw', [
            odooService._session.db,
            odooService._session.uid,
            odooService._session.password,
            params.model,
            'read_group',
            [params.args[0] || []], // domain
            params.args[1] || [], // fields
            params.args[2] || [], // groupby
            {
              offset: params.kwargs?.offset || 0,
              limit: params.kwargs?.limit || 0,
              orderby: params.kwargs?.orderby || '',
              lazy: params.kwargs?.lazy !== false
            }
          ])

        case 'sendSession':
          // Per la modalità statica, non abbiamo sessioni server-side
          // Possiamo implementare questo se necessario
          return { session_id: 'static_mode_session' }

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