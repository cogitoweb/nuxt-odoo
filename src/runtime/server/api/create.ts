import { getOdoo } from '../utils/odooInstance'
import { defineEventHandler, readBody, createError } from '#imports'

const odoo = getOdoo()

export default defineEventHandler(async (event) => {
  try {
    const isLoggedIn = await odoo.isLoggedIn()
    if (!isLoggedIn) {
      throw new Error('Sessione non valida. Eseguire il login prima.')
    }
    const { model, context, data } = await readBody(event)
    return await odoo.create(model, data, {
      context,
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
