'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'

export function LogoutButton() {
  const router = useRouter()
  const clearAuth = useAuthStore((state) => state.clearAuth)

  return (
    <button
      type="button"
      className="tap-target rounded-lg border border-ironman-navy px-3 py-2 text-sm font-semibold text-ironman-navy"
      onClick={() => {
        clearAuth()
        router.push('/login')
      }}
    >
      Logout
    </button>
  )
}
