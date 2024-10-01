import odoo from '../../utils/odooInstance'
import { defineEventHandler, createError } from '#imports'

export default defineEventHandler(async () => {
  try {
    return await odoo.isLoggedIn()
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore nel controllo del login',
      data: error instanceof Error ? error.message : 'Errore sconosciuto',
    })
  }
})
