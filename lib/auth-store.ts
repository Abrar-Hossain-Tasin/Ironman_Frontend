'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse, UserSummary } from '@/types'

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: UserSummary | null
  setAuth: (auth: AuthResponse) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (auth) =>
        set({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          user: auth.user
        }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, user: null })
    }),
    {
      name: 'ironman-auth'
    }
  )
)

export function roleHome(role?: string) {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'delivery_man') return '/delivery/dashboard'
  if (role === 'wash_man' || role === 'iron_man' || role === 'dry_clean_man') return '/worker/dashboard'
  return '/customer/dashboard'
}
