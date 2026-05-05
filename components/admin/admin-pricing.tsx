'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { RequireAuth } from '@/components/auth/require-auth'
import { PricingTable } from '@/components/ui/pricing-table'
import { apiFetch, endpoints } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { decorateCategories, decorateClothingTypes } from '@/lib/catalog'
import type { ClothingType, PricingCell, ServiceCategory } from '@/types'

export function AdminPricing() {
  const token = useAuthStore((state) => state.accessToken)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [clothingTypes, setClothingTypes] = useState<ClothingType[]>([])
  const [pricing, setPricing] = useState<PricingCell[]>([])
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    const [nextCategories, nextClothingTypes, nextPricing] = await Promise.all([
      apiFetch<ServiceCategory[]>(endpoints.categories),
      apiFetch<ClothingType[]>(endpoints.clothingTypes),
      apiFetch<PricingCell[]>(endpoints.pricing)
    ])
    setCategories(nextCategories)
    setClothingTypes(nextClothingTypes)
    setPricing(nextPricing)
  }

  useEffect(() => {
    void load()
  }, [])

  async function savePrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    const form = new FormData(event.currentTarget)
    await apiFetch('/admin/pricing', {
      method: 'POST',
      token,
      body: {
        serviceCategoryId: String(form.get('serviceCategoryId') ?? ''),
        clothingTypeId: String(form.get('clothingTypeId') ?? ''),
        price: Number(form.get('price') ?? 0),
        effectiveFrom: String(form.get('effectiveFrom') ?? new Date().toISOString().slice(0, 10))
      }
    })
    setMessage('Price saved')
    await load()
  }

  const decoratedCategories = useMemo(() => decorateCategories(categories, pricing), [categories, pricing])
  const decoratedClothingTypes = useMemo(() => decorateClothingTypes(clothingTypes), [clothingTypes])

  return (
    <RequireAuth roles={['admin']}>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <PricingTable categories={decoratedCategories} clothingTypes={decoratedClothingTypes} pricing={pricing} />
        <form className="h-fit rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft" onSubmit={savePrice}>
          <h2 className="text-xl font-bold text-ironman-navy">Set Price</h2>
          <div className="mt-4 space-y-3">
            <select name="serviceCategoryId" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" required>
              <option value="">Service</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <select name="clothingTypeId" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" required>
              <option value="">Clothing</option>
              {clothingTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <input name="price" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="BDT amount" type="number" min="0" required />
            <input name="effectiveFrom" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>
          {message ? <p className="mt-3 rounded-lg bg-ironman-navy-50 px-3 py-2 text-sm font-semibold text-ironman-navy">{message}</p> : null}
          <button className="tap-target mt-4 w-full rounded-lg bg-ironman-red px-4 py-2 font-semibold text-white" type="submit">Save Price</button>
        </form>
      </div>
    </RequireAuth>
  )
}
