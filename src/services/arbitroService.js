import { api } from './api'

export const arbitroService = {
  // Perfil completo del árbitro autenticado
  getPerfil() {
    return api.get('/arbitros/me')
  },

  // Cambio de contraseña
  cambiarContrasenia(contraseniaActual, nuevaContrasenia) {
    return api.put('/arbitros/me/contrasenia', {
      contraseniaActual,
      nuevaContrasenia
    })
  },

  // Consulta de disponibilidad fin de semana
  getDisponibilidad() {
    return api.get('/arbitros/me/disponibilidad')
  },

  // Actualiza disponibilidad fin de semana
  guardarDisponibilidad({ disponibleSabado, disponibleDomingo, estado = true }) {
    return api.put('/arbitros/me/disponibilidad', {
      estado,
      disponibleSabado,
      disponibleDomingo
    })
  },

  // Historial y próximos partidos asignados
  getDesignaciones(page = 0, size = 10) {
    return api.get(`/arbitros/me/designaciones?page=${page}&size=${size}`)
  },

  // Suspensiones y llamados de atención
  getSuspenciones(page = 0, size = 10) {
    return api.get(`/arbitros/me/suspenciones?page=${page}&size=${size}`)
  },

  // Estado de cuenta consolidado (deuda préstamos, recuperos, cuotas)
  getEstadoCuenta() {
    return api.get('/arbitros/me/estado-cuenta')
  },

  // Estadísticas detalladas de rendimiento
  getEstadisticas({ inicio, fin, orden = 'DESC', page = 0, size = 10 } = {}) {
    const params = new URLSearchParams()
    if (inicio) params.append('inicio', inicio)
    if (fin) params.append('fin', fin)
    if (orden) params.append('orden', orden)
    if (page !== undefined) params.append('page', page)
    if (size !== undefined) params.append('size', size)
    const qs = params.toString()
    return api.get(`/arbitros/me/estadisticas${qs ? `?${qs}` : ''}`)
  },

  // Canchas activas
  getCanchasActivas(page = 0, size = 50) {
    return api.get(`/canchas/activas?page=${page}&size=${size}`)
  }
}

