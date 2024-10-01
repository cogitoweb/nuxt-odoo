import { OdooRPC } from 'odoo-jsonrpc-extended'
import { useRuntimeConfig } from '#imports'

const odoo = new OdooRPC()
const config = useRuntimeConfig()
odoo.setOdooServer(config.public.odooBaseUrl as string)

export default odoo
