'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { roleHome, useAuthStore } from '@/lib/auth-store'
import type { AuthResponse } from '@/types'

type AuthFormProps = {
  mode: 'login' | 'register'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const payload =
      mode === 'login'
        ? {
            email: String(form.get('email') ?? ''),
            password: String(form.get('password') ?? '')
          }
        : {
            fullName: String(form.get('fullName') ?? ''),
            email: String(form.get('email') ?? ''),
            phone: String(form.get('phone') ?? ''),
            password: String(form.get('password') ?? '')
          }

    try {
      const auth = await apiFetch<AuthResponse>(mode === 'login' ? '/auth/login' : '/auth/register', {
        method: 'POST',
        body: payload
      })
      setAuth(auth)

      const address = String(form.get('address') ?? '').trim()
      if (mode === 'register' && address) {
        await apiFetch('/users/me/addresses', {
          method: 'POST',
          token: auth.accessToken,
          body: {
            label: 'Home',
            addressLine1: address,
            area: 'Dhaka',
            city: 'Dhaka',
            defaultAddress: true
          }
        })
      }

      router.push(roleHome(auth.user.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={submit}>
      {mode === 'register' ? (
        <>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Full name</span>
            <input name="fullName" className="tap-target mt-2 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Abrar Rahman" required />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Phone</span>
            <input name="phone" className="tap-target mt-2 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="+8801..." required />
          </label>
        </>
      ) : null}
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</span>
        <input name="email" className="tap-target mt-2 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="you@example.com" type="email" required />
      </label>
      <label className="block">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Password</span>
        <input name="password" className="tap-target mt-2 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="********" type="password" minLength={8} required />
      </label>
      {mode === 'register' ? (
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Default address</span>
          <textarea name="address" className="mt-2 min-h-24 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="House, road, area, city" />
        </label>
      ) : null}
      {error ? <p className="rounded-lg bg-ironman-red-50 px-3 py-2 text-sm font-semibold text-ironman-red">{error}</p> : null}
      <button className="tap-target focus-ring inline-flex w-full items-center justify-center rounded-lg bg-ironman-red px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70" disabled={loading} type="submit">
        {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
      </button>
    </form>
  )
}
