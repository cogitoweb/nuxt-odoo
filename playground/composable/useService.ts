import authService from '~/services/auth'

export function useSevices() {
  return {
    auth: authService,
  }
}
