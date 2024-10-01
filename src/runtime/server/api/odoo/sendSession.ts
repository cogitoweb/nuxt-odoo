import odoo from '../../utils/odooInstance'
import { defineEventHandler, createError } from '#imports'

export default defineEventHandler(async (event) => {
  try {
    const sessionId = event.node.req.headers.session_id
    if (typeof sessionId !== 'string') {
      throw new TypeError('Session ID non valido')
    }
    odoo.setCookie(sessionId)
    return await odoo.isLoggedIn()
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore nella ricerca',
      data: error instanceof Error ? error.message : 'Errore sconosciuto',
    })
  }
})
