/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRuntimeConfig } from '#app'

const odooService = {
  // Metodo per determinare se usare API dirette o server handlers
  _shouldUseDirectApi(): boolean {
    const config = useRuntimeConfig()
    return config.public.odooIsStatic as boolean
  },

  // Session state per modalità statica (simile al tuo Cookies class)
  _session: {
    session_id: null as string | null,
    context: { lang: "it_IT" } as any,
  },

  // Gestisce errori come nel tuo handleOdooErrors
  _handleOdooErrors: (response: any) => {
    if (!response.error) return response.result

    const error = response.error

    // Gestione errori sessione scaduta (dal tuo codice originale)
    if ((error.code === 100 && error.message === "Odoo Session Expired") ||
        (error.code === 300 && error.message === "OpenERP WebClient Error" && 
         error.data.debug && error.data.debug.match("SessionExpiredException"))) {
      
      // Pulisci la sessione locale
      odooService._session.session_id = null
      
      // Pulisci il localStorage (solo se siamo nel browser)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('session_id')
        // Reindirizza al login
        window.location.href = '/production/dashboard/login'
      }
      
      throw {
        data: {
          message: "Sessione scaduta",
          data: "session_expired"
        }
      }
    }

    // Altri errori
    if (error.data && error.data.name === "openerp.exceptions.AccessError") {
      throw {
        data: {
          message: "Errore di accesso",
          data: error.data.message
        }
      }
    }

    throw {
      data: {
        message: error.message || "Errore Odoo",
        data: error.data?.message || "Errore sconosciuto"
      }
    }
  },

  // Metodo per chiamate dirette (simile al tuo sendRequest)
  _sendRequest: async (url: string, params: any) => {
    const config = useRuntimeConfig()

    const headers: any = {
      "Content-Type": "application/json"
    }

    // Aggiungi session_id negli headers se disponibile
    if (odooService._session.session_id) {
      headers["X-Openerp-Session-Id"] = odooService._session.session_id
    }

    // Costruisci il body esattamente come nel tuo buildRequest originale
    const body = {
      jsonrpc: "2.0",
      method: "call",
      params: params // Direttamente l'oggetto params, non wrappato
    }

    const response = await $fetch(url, {
      method: 'POST',
      baseURL: config.public.odooBaseUrl as string,
      headers: headers,
      body: body // Passa l'oggetto direttamente, $fetch lo stringificherà automaticamente
    }) as any

    return odooService._handleOdooErrors(response)
  },

  // Login diretto (simile al tuo login)
  _loginDirect: async (db: string, username: string, password: string) => {
    const params = {
      db: db,
      login: username, // Usa "login" come chiave, non "username"
      password: password,
    }

    const result = await odooService._sendRequest("/web/session/authenticate", params)

    if (!result.uid) {
      odooService._session.session_id = null
      throw {
        data: {
          message: "Credenziali non valide",
          data: "Username o password errati"
        }
      }
    }

    // Salva la sessione (come nel tuo codice originale)
    if (result.user_context) {
      odooService._session.context = result.user_context
    }
    odooService._session.session_id = result.session_id

    return result
  },

  // isLoggedIn diretto (simile al tuo isLoggedIn)
  _isLoggedInDirect: async () => {
    try {
      const result = await odooService._sendRequest("/web/session/get_session_info", {})
      if (result.session_id) {
        odooService._session.session_id = result.session_id
      }
      return !!result.uid
    } catch (error) {
      return false
    }
  },

  // Logout diretto (simile al tuo logout)
  _logoutDirect: async () => {
    odooService._session.session_id = null
    try {
      const result = await odooService._sendRequest("/web/session/get_session_info", {})
      if (result.db) {
        // Forza logout come nel tuo codice
        await odooService._loginDirect(result.db, "", "")
      }
    } catch (error) {
      // Ignora errori durante logout
    }
    return { success: true }
  },

  // Call diretto (simile al tuo call)
  _callDirect: async (model: string, method: string, args: any[], kwargs: any) => {
    kwargs = kwargs || {}
    kwargs.context = kwargs.context || {}
    Object.assign(kwargs.context, odooService._session.context)

    const params = {
      model: model,
      method: method,
      args: args,
      kwargs: kwargs,
    }

    return await odooService._sendRequest("/web/dataset/call_kw", params)
  },

  callOdoo: async (endpoint: string, params: any = {}, headers: any = {}) => {
    const shouldUseDirectApi = odooService._shouldUseDirectApi()
    
    if (shouldUseDirectApi) {
      // Modalità statica: usa le API web di Odoo come il plugin originale
      
      switch (endpoint) {
        case 'login':
          return await odooService._loginDirect(params.db, params.username, params.password)

        case 'isLoggedIn':
          return await odooService._isLoggedInDirect()

        case 'logout':
          return await odooService._logoutDirect()

        case 'searchRead':
          // searchRead viene chiamato come: odoo.searchRead(model, {fields, domain})
          return await odooService._callDirect(params.model, 'search_read', [params.domain || []], {
            context: params.context || odooService._session.context,
            fields: params.fields,
            offset: params.offset || 0,
            limit: params.limit || 0,
            order: params.order,
          })

        case 'call':
          return await odooService._callDirect(params.model, params.method, params.args || [], params.kwargs || {})

        case 'create':
          return await odooService._callDirect(params.model, 'create', [params.data], {
            context: params.context || odooService._session.context,
          })

        case 'read':
          const ids = Array.isArray(params.ids) ? params.ids : [params.ids]
          return await odooService._callDirect(params.model, 'read', [ids], {
            context: params.context || odooService._session.context,
            fields: params.fields,
          })

        case 'write':
          const writeIds = Array.isArray(params.ids) ? params.ids : [params.ids]
          return await odooService._callDirect(params.model, 'write', [writeIds, params.data], {
            context: params.context || odooService._session.context,
          })

        case 'unlink':
          const unlinkIds = Array.isArray(params.ids) ? params.ids : [params.ids]
          return await odooService._callDirect(params.model, 'unlink', [unlinkIds], {
            context: params.context || odooService._session.context,
          })

        case 'search':
          return await odooService._callDirect(params.model, 'search', [params.domain || []], {
            context: params.context || odooService._session.context,
            fields: params.fields,
            offset: params.offset || 0,
            limit: params.limit || 0,
            order: params.order,
          })

        case 'searchCount':
          return await odooService._callDirect(params.model, 'search_count', [params.domain || []], {
            context: params.context || odooService._session.context,
          })

        case 'fieldsGet':
          return await odooService._callDirect(params.model, 'fields_get', [params.fields || []], {
            context: params.context || odooService._session.context,
            attributes: params.attributes || ["string", "help", "type"],
          })

        case 'readGroup':
          // readGroup viene chiamato come: odoo.readGroup(model, [], kwargs)
          // I parametri sono tutti dentro l'oggetto kwargs che viene passato direttamente
          return await odooService._callDirect(params.model, 'read_group', 
            [params.domain || []], // domain
            {
              context: params.context || odooService._session.context,
              fields: params.fields || [], 
              groupby: params.groupby || [],
              offset: params.offset || 0,
              limit: params.limit || 0,
              orderby: params.orderby || '',
              lazy: params.lazy !== false
            }
          )

        case 'sendSession':
          // CORRETTO: Imposta il session_id nella sessione interna
          if (headers.session_id) {
            odooService._session.session_id = headers.session_id
            
            // Testa la validità della sessione facendo una chiamata di test
            try {
              await odooService._sendRequest("/web/session/get_session_info", {})
              return { 
                success: true, 
                session_id: headers.session_id 
              }
            } catch (error: any) {
              // Se la sessione non è valida, pulisci tutto
              odooService._session.session_id = null
              if (typeof window !== 'undefined') {
                localStorage.removeItem('session_id')
              }
              throw error
            }
          }
          
          return { 
            success: true, 
            session_id: odooService._session.session_id 
          }

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
    await odooService.callOdoo('readGroup', { model, ...kwargs }), 
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