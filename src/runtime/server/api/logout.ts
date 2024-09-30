import { getOdoo } from '../utils/odooInstance'
import { defineEventHandler, createError } from '#imports'

const odoo = getOdoo()

export default defineEventHandler(async () => {
  try {
    return await odoo.logout(true)
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore nel logout',
      data: error instanceof Error ? error.message : 'Errore sconosciuto',
    })
  }
})
