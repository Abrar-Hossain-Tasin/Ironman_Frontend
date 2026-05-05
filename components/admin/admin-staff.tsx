'use client'

import { FormEvent, useEffect, useState } from 'react'
import { RequireAuth } from '@/components/auth/require-auth'
import { StatusBadge } from '@/components/ui/status-badge'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import type { UserRole, UserSummary } from '@/types'

export function AdminStaff() {
  const token = useAuthStore((state) => state.accessToken)
  const [staff, setStaff] = useState<UserSummary[]>([])
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    if (!token) return
    setStaff(await apiFetch<UserSummary[]>('/admin/staff', { token }))
  }

  useEffect(() => {
    void load()
  }, [token])

  async function createStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    const form = new FormData(event.currentTarget)
    await apiFetch<UserSummary>('/auth/admin/create-staff', {
      method: 'POST',
      token,
      body: {
        fullName: String(form.get('fullName') ?? ''),
        email: String(form.get('email') ?? ''),
        phone: String(form.get('phone') ?? ''),
        password: String(form.get('password') ?? ''),
        role: String(form.get('role') ?? 'delivery_man') as UserRole
      }
    })
    setMessage('Staff account created')
    event.currentTarget.reset()
    await load()
  }

  return (
    <RequireAuth roles={['admin']}>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          {staff.map((person) => (
            <article key={person.id} className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-ironman-navy">{person.fullName}</h2>
                  <p className="mt-1 text-sm text-gray-600">{person.role.replaceAll('_', ' ')}</p>
                  <p className="mt-1 text-sm text-gray-600">{person.email}</p>
                </div>
                <StatusBadge status={person.active ? 'accepted' : 'rejected'} />
              </div>
            </article>
          ))}
        </div>
        <form className="h-fit rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft" onSubmit={createStaff}>
          <h2 className="text-xl font-bold text-ironman-navy">Create Staff</h2>
          <div className="mt-4 space-y-3">
            <input name="fullName" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Full name" required />
            <input name="email" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Email" type="email" required />
            <input name="phone" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Phone" required />
            <input name="password" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Password" type="password" minLength={8} required />
            <select name="role" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" defaultValue="delivery_man">
              <option value="delivery_man">Delivery man</option>
              <option value="wash_man">Wash man</option>
              <option value="iron_man">Iron man</option>
              <option value="dry_clean_man">Dry clean man</option>
            </select>
          </div>
          {message ? <p className="mt-3 rounded-lg bg-ironman-navy-50 px-3 py-2 text-sm font-semibold text-ironman-navy">{message}</p> : null}
          <button className="tap-target mt-4 w-full rounded-lg bg-ironman-red px-4 py-2 font-semibold text-white" type="submit">Create</button>
        </form>
      </div>
    </RequireAuth>
  )
}
