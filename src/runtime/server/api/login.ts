import { getOdoo } from '../utils/odooInstance'
import { defineEventHandler, readBody, createError } from '#imports'

const odoo = getOdoo()

export default defineEventHandler(async (event) => {
  try {
    const { db, username, password } = await readBody(event)
    const result = await odoo.login(db, username, password)
    return result
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Errore nel login',
      data: error instanceof Error ? error.message : 'Errore sconosciuto',
    })
  }
})
