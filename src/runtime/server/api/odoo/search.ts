import odoo from '../../utils/odooInstance'
import { defineEventHandler, readBody, createError } from '#imports'

export default defineEventHandler(async (event) => {
  try {
    const isLoggedIn = await odoo.isLoggedIn()
    if (!isLoggedIn) {
      throw new Error('Sessione non valida. Eseguire il login prima.')
    }
    const { model, domain, context, fields, offset, limit, order } = await readBody(event)
    return await odoo.search(model, {
      domain, context, fields, offset, limit, order,
    })
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore nella ricerca',
      data: error instanceof Error ? error.message : 'Errore sconosciuto',
    })
  }
})
