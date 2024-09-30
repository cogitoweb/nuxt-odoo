import { OdooRPC } from 'odoo-jsonrpc-extended'

let odooInstance: OdooRPC | null = null

export function initOdoo(baseUrl: string): OdooRPC {
  if (!odooInstance) {
    odooInstance = new OdooRPC()
    odooInstance.setOdooServer(baseUrl)
  }
  return odooInstance
}

export function getOdoo(): OdooRPC {
  if (!odooInstance) {
    throw new Error('Odoo non è stato inizializzato. Chiama initOdoo prima.')
  }
  return odooInstance
}
