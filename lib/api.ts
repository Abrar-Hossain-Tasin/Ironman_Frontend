import type { AuthResponse } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8090/api/v1'

type ApiOptions = Omit<RequestInit, 'body'> & {
  token?: string | null
  body?: BodyInit | Record<string, unknown> | null
  /** When true, skip the silent-refresh retry on 401. Used internally to avoid loops. */
  skipRefresh?: boolean
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string
  ) {
    super(message)
  }
}

// Pluggable hooks wired by the auth store. Defined as module-level callbacks
// so this file stays framework-agnostic (no React imports) and can be called
// from anywhere — including non-component code paths.
type RefreshContext = {
  getRefreshToken: () => string | null
  onRefreshed: (auth: AuthResponse) => void
  onAuthLost: () => void
}

let refreshCtx: RefreshContext | null = null
let inFlightRefresh: Promise<AuthResponse | null> | null = null

export function configureAuthRefresh(ctx: RefreshContext) {
  refreshCtx = ctx
}

async function attemptRefresh(): Promise<AuthResponse | null> {
  if (!refreshCtx) return null
  const refreshToken = refreshCtx.getRefreshToken()
  if (!refreshToken) return null
  // De-dupe concurrent refreshes so a burst of 401s only triggers one /auth/refresh.
  if (inFlightRefresh) return inFlightRefresh
  inFlightRefresh = (async () => {
    try {
      const next = await apiFetch<AuthResponse>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
        skipRefresh: true
      })
      refreshCtx?.onRefreshed(next)
      return next
    } catch {
      refreshCtx?.onAuthLost()
      return null
    } finally {
      inFlightRefresh = null
    }
  })()
  return inFlightRefresh
}

export async function apiFetch<T>(path: string, init?: ApiOptions): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')

  if (init?.token) {
    headers.set('Authorization', `Bearer ${init.token}`)
  }

  let body: BodyInit | null | undefined
  if (
    init?.body &&
    typeof init.body === 'object' &&
    !(init.body instanceof FormData) &&
    !(init.body instanceof Blob) &&
    !(init.body instanceof URLSearchParams)
  ) {
    body = JSON.stringify(init.body)
  } else {
    body = init?.body as BodyInit | null | undefined
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    body,
    cache: 'no-store'
  })

  // ─── 401 → silent refresh + retry (once) ─────────────────────────────
  // We only attempt when the caller sent a token (i.e. it's an authed call)
  // and we haven't already retried this request.
  if (response.status === 401 && init?.token && !init.skipRefresh) {
    const next = await attemptRefresh()
    if (next?.accessToken) {
      return apiFetch<T>(path, { ...init, token: next.accessToken, skipRefresh: true })
    }
  }

  if (!response.ok) {
    let detail = `API request failed: ${response.status}`
    const resClone = response.clone()
    try {
      const problem = await response.json()
      detail = problem.detail ?? problem.title ?? detail
    } catch {
      detail = await resClone.text()
    }
    throw new ApiError(detail, response.status, detail)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const endpoints = {
  categories: '/services/categories',
  clothingTypes: '/services/clothing-types',
  pricing: '/services/pricing',
  adminPricing: '/admin/pricing',
  adminPricingHistory: '/admin/pricing/history',
  adminDeactivatePricing: (id: string) => `/admin/pricing/${id}`,
  tracking: (orderNumber: string) => `/tracking/${orderNumber}`
}

export function apiUrl(path: string) {
  return `${API_URL}${path}`
}
