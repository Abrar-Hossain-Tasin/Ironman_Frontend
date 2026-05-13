'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { configureAuthRefresh } from '@/lib/api'
import type { AuthResponse, UserSummary } from '@/types'

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: UserSummary | null
  hasHydrated: boolean
  setAuth: (auth: AuthResponse) => void
  clearAuth: () => void
  setHasHydrated: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      hasHydrated: false,
      setAuth: (auth) =>
        set({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          user: auth.user
        }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, user: null }),
      setHasHydrated: (value) => set({ hasHydrated: value })
    }),
    {
      name: 'ironman-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
)

// Wire the api layer to read/write tokens via the same store so a silent
// refresh transparently updates every component that subscribes.
configureAuthRefresh({
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  onRefreshed: (auth) => useAuthStore.getState().setAuth(auth),
  onAuthLost: () => {
    useAuthStore.getState().clearAuth()
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.assign('/login')
    }
  }
})

export function roleHome(role?: string) {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'delivery_man') return '/delivery/dashboard'
  if (role === 'wash_man' || role === 'iron_man' || role === 'dry_clean_man') return '/worker/dashboard'
  return '/customer/dashboard'
}
