import odoo from '../../utils/odooInstance'
import { defineEventHandler, readBody, createError } from '#imports'

export default defineEventHandler(async (event) => {
  try {
    const isLoggedIn = await odoo.isLoggedIn()
    if (!isLoggedIn) {
      throw new Error('Sessione non valida. Eseguire il login prima.')
    }
    const { model, context, fields, attributes } = await readBody(event)
    return await odoo.fieldsGet(model, {
      context, fields, attributes,
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
