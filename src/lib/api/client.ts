import { mockHandlers } from '@/lib/mock/handlers'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const KEY_STORAGE = 'msig_ak'

export class ApiError extends Error {
  constructor(public code: string, message: string, public details?: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// On page load: extract key from URL hash into sessionStorage, then remove hash from URL.
// Hash is never sent to the server by the browser (HTTP spec), so it won't appear in logs.
;(function () {
  const match = window.location.hash.match(/(?:^#|&)key=([^&]+)/)
  if (match) {
    sessionStorage.setItem(KEY_STORAGE, decodeURIComponent(match[1]))
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }
})()

// Computed once at module load — stable for the entire session.
const LIVE_KEY = sessionStorage.getItem(KEY_STORAGE)

async function httpGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const url = new URL(`${BASE_URL}/api/v1${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
    })
  }
  const headers: HeadersInit = LIVE_KEY ? { 'X-API-Key': LIVE_KEY } : {}
  const res = await fetch(url.toString(), { headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ code: 'UNKNOWN', message: 'Request failed' }))
    throw new ApiError(err.code, err.message, err.details)
  }
  return res.json()
}

async function httpPost<T>(path: string, body: unknown): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(LIVE_KEY ? { 'X-API-Key': LIVE_KEY } : {}),
  }
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ code: 'UNKNOWN', message: 'Request failed' }))
    throw new ApiError(err.code, err.message, err.details)
  }
  return res.json()
}

async function httpPublicGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const url = new URL(`${BASE_URL}/api/public/v1${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
    })
  }
  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json().catch(() => ({ code: 'UNKNOWN', message: 'Request failed' }))
    throw new ApiError(err.code, err.message, err.details)
  }
  return res.json()
}

async function httpPublicPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/public/v1${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ code: 'UNKNOWN', message: 'Request failed' }))
    throw new ApiError(err.code, err.message, err.details)
  }
  return res.json()
}

async function httpDelete(path: string): Promise<void> {
  const headers: HeadersInit = LIVE_KEY ? { 'X-API-Key': LIVE_KEY } : {}
  const res = await fetch(`${BASE_URL}/api/v1${path}`, { method: 'DELETE', headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ code: 'UNKNOWN', message: 'Request failed' }))
    throw new ApiError(err.code, err.message, err.details)
  }
}

export function getAuthHeaders(): Record<string, string> {
  return LIVE_KEY ? { 'X-API-Key': LIVE_KEY } : {}
}

export { BASE_URL }

export const apiClient = {
  get: httpGet,
  post: httpPost,
  delete: httpDelete,
  publicGet: httpPublicGet,
  publicPost: httpPublicPost,
  useMock: LIVE_KEY === null,
  mock: mockHandlers,
}
