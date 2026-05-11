// const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'
// // const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://192.168.0.108:8080/api/v1'

// type ApiOptions = Omit<RequestInit, 'body'> & {
//   token?: string | null
//   body?: BodyInit | Record<string, unknown> | null
// }

// export class ApiError extends Error {
//   constructor(
//     message: string,
//     public status: number,
//     public detail?: string
//   ) {
//     super(message)
//   }
// }

// export async function apiFetch<T>(path: string, init?: ApiOptions): Promise<T> {
//   const headers = new Headers(init?.headers)
//   headers.set('Content-Type', 'application/json')
//   if (init?.token) {
//     headers.set('Authorization', `Bearer ${init.token}`)
//   }

//   let body: BodyInit | null | undefined
//   if (init?.body && typeof init.body === 'object' && !(init.body instanceof FormData) && !(init.body instanceof Blob) && !(init.body instanceof URLSearchParams)) {
//     body = JSON.stringify(init.body)
//   } else {
//     body = init?.body as BodyInit | null | undefined
//   }

//   const response = await fetch(`${API_URL}${path}`, {
//     ...init,
//     headers,
//     body,
//     cache: 'no-store'
//   })

//   if (!response.ok) {
//     let detail = `API request failed: ${response.status}`
//     try {
//       const problem = await response.json()
//       detail = problem.detail ?? problem.title ?? detail
//     } catch {
//       detail = await response.text()
//     }
//     throw new ApiError(detail, response.status, detail)
//   }

//   if (response.status === 204) {
//     return undefined as T
//   }

//   return response.json() as Promise<T>
// }

// // export const endpoints = {
// //   categories: '/services/categories',
// //   clothingTypes: '/services/clothing-types',
// //   pricing: '/services/pricing',
// //   tracking: (orderNumber: string) => `/tracking/${orderNumber}`
// // }


// // lib/api.ts

// // ... existing code
// export const endpoints = {
//   categories: '/services/categories',
//   clothingTypes: '/services/clothing-types',
//   pricing: '/services/pricing', // current active pricing
//   adminPricing: '/admin/pricing', // POST to set, GET /history
//   adminPricingHistory: '/admin/pricing/history',
//   adminDeactivatePricing: (id: string) => `/admin/pricing/${id}`,
//   tracking: (orderNumber: string) => `/tracking/${orderNumber}`
// }

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1'

type ApiOptions = Omit<RequestInit, 'body'> & {
  token?: string | null
  body?: BodyInit | Record<string, unknown> | null
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

  // ─── ERROR HANDLING BLOCK (WITH CLONE FIX) ───
  if (!response.ok) {
    let detail = `API request failed: ${response.status}`
    
    // We clone the response because the stream can only be read once.
    // This allows us to try parsing JSON first, then fallback to Text.
    const resClone = response.clone()
    
    try {
      const problem = await response.json()
      detail = problem.detail ?? problem.title ?? detail
    } catch {
      // If parsing JSON fails, we use the clone to read the raw text
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
  pricing: '/services/pricing',            // Current active pricing
  adminPricing: '/admin/pricing',          // POST to set new prices
  adminPricingHistory: '/admin/pricing/history',
  adminDeactivatePricing: (id: string) => `/admin/pricing/${id}`,
  tracking: (orderNumber: string) => `/tracking/${orderNumber}`
}