const authService = {
  login: async (odoo: any, username: string, password: string) => {
    try {
      const config = useRuntimeConfig()
      const result = await odoo.login(
        config.public.odooDbName,
        username,
        password,
      )
      return result
    }
    catch (error: any) {
      console.error('Errore durante il login:', error)
      throw error
    }
  },
}

export default authService
