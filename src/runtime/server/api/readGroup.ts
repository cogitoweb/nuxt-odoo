import { getOdoo } from '../utils/odooInstance'
import { defineEventHandler, readBody, createError } from '#imports'

const odoo = getOdoo()

export default defineEventHandler(async (event) => {
  try {
    const isLoggedIn = await odoo.isLoggedIn()
    if (!isLoggedIn) {
      throw new Error('Sessione non valida. Eseguire il login prima.')
    }
    const { model, args, kwargs } = await readBody(event)
    return await odoo.call(model, 'read_group', args, kwargs)
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore nella ricerca',
      data: error instanceof Error ? error.message : 'Errore sconosciuto',
    })
  }
})
