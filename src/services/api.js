const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('arbitro_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers
  })

  if (response.status === 401) {
    localStorage.removeItem('arbitro_token')
    localStorage.removeItem('arbitro_user')
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    throw new Error('Sesión expirada o no autorizada')
  }

  const contentType = response.headers.get('content-type') || ''
  let data = null
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => null)
  } else {
    data = await response.text().catch(() => null)
  }

  if (!response.ok) {
    const errorMsg = (data && typeof data === 'object' && (data.message || data.error)) ||
      (typeof data === 'string' && data) ||
      `Error ${response.status}: ${response.statusText}`
    throw new Error(errorMsg)
  }

  return data
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, {
    ...options,
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined
  }),
  put: (endpoint, body, options = {}) => request(endpoint, {
    ...options,
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined
  }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' })
}

