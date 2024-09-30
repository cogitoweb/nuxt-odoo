/* eslint-disable @typescript-eslint/no-explicit-any */
const odooService = {
  callOdoo: async (endpoint: string, params: any = {}, headers: any = {}) => {
    // eslint-disable-next-line no-useless-catch
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
