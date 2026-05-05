'use client'

import { FormEvent, useEffect, useState } from 'react'
import { RequireAuth } from '@/components/auth/require-auth'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import type { AddressResponse, UserSummary } from '@/types'

export function CustomerProfile() {
  const token = useAuthStore((state) => state.accessToken)
  const [user, setUser] = useState<UserSummary | null>(null)
  const [addresses, setAddresses] = useState<AddressResponse[]>([])
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    Promise.all([
      apiFetch<UserSummary>('/users/me', { token }),
      apiFetch<AddressResponse[]>('/users/me/addresses', { token })
    ]).then(([nextUser, nextAddresses]) => {
      setUser(nextUser)
      setAddresses(nextAddresses)
    })
  }, [token])

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    const form = new FormData(event.currentTarget)
    const updated = await apiFetch<UserSummary>('/users/me', {
      method: 'PUT',
      token,
      body: {
        fullName: String(form.get('fullName') ?? ''),
        phone: String(form.get('phone') ?? ''),
        profilePictureUrl: user?.profilePictureUrl ?? null
      }
    })
    setUser(updated)
    setMessage('Profile updated')
  }

  async function addAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    const form = new FormData(event.currentTarget)
    const saved = await apiFetch<AddressResponse>('/users/me/addresses', {
      method: 'POST',
      token,
      body: {
        label: String(form.get('label') ?? 'Home'),
        addressLine1: String(form.get('addressLine1') ?? ''),
        area: String(form.get('area') ?? ''),
        city: String(form.get('city') ?? 'Dhaka'),
        postalCode: String(form.get('postalCode') ?? ''),
        defaultAddress: form.get('defaultAddress') === 'on'
      }
    })
    setAddresses((current) => [...current, saved])
    event.currentTarget.reset()
  }

  return (
    <RequireAuth roles={['customer']}>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-ironman-navy">Profile</h2>
          <form className="mt-4 space-y-3" onSubmit={updateProfile}>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Full name</span>
              <input name="fullName" className="tap-target mt-2 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" defaultValue={user?.fullName ?? ''} required />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</span>
              <input className="tap-target mt-2 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2" value={user?.email ?? ''} readOnly />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Phone</span>
              <input name="phone" className="tap-target mt-2 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" defaultValue={user?.phone ?? ''} required />
            </label>
            {message ? <p className="rounded-lg bg-ironman-navy-50 px-3 py-2 text-sm font-semibold text-ironman-navy">{message}</p> : null}
            <button className="tap-target rounded-lg bg-ironman-red px-4 py-2 font-semibold text-white" type="submit">Save Profile</button>
          </form>
        </section>
        <section className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-ironman-navy">Addresses</h2>
          {addresses.map((address) => (
            <div key={address.id} className="mt-4 rounded-lg bg-ironman-navy-50 p-4">
              <p className="font-bold text-ironman-navy">{address.label}{address.defaultAddress ? ' · Default' : ''}</p>
              <p className="mt-1 text-sm text-gray-600">{address.addressLine1}, {address.area}, {address.city}</p>
            </div>
          ))}
          <form className="mt-5 grid gap-3" onSubmit={addAddress}>
            <input name="label" className="tap-target rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Label" required />
            <input name="addressLine1" className="tap-target rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Address line" required />
            <input name="area" className="tap-target rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Area" required />
            <input name="city" className="tap-target rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="City" defaultValue="Dhaka" required />
            <input name="postalCode" className="tap-target rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Postal code" />
            <label className="flex items-center gap-2 text-sm font-semibold text-ironman-navy">
              <input name="defaultAddress" type="checkbox" />
              Set as default
            </label>
            <button className="tap-target rounded-lg bg-ironman-navy px-4 py-2 font-semibold text-white" type="submit">Add Address</button>
          </form>
        </section>
      </div>
    </RequireAuth>
  )
}
