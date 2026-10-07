import { api } from './api'

export const authService = {
  async login(whatsapp, contrasenia) {
    const data = await api.post('/auth/login', { whatsapp, contrasenia })
    // AuthResponse normalmente incluye token y datos de usuario o roles
    const token = data.token || data.jwt || data.accessToken || (typeof data === 'string' ? data : null)
    if (token) {
      localStorage.setItem('arbitro_token', token)
    }
    localStorage.setItem('arbitro_user', JSON.stringify(data))
    return data
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignorar error de red al desloguear
    } finally {
      localStorage.removeItem('arbitro_token')
      localStorage.removeItem('arbitro_user')
    }
  },

  getToken() {
    return localStorage.getItem('arbitro_token')
  },

  getUser() {
    const raw = localStorage.getItem('arbitro_user')
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },

  isAuthenticated() {
    return !!this.getToken()
  }
}

