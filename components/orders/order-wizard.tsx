'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus } from 'lucide-react'
import { RequireAuth } from '@/components/auth/require-auth'
import { apiFetch, endpoints } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { decorateClothingTypes } from '@/lib/catalog'
import { formatBdt, isoDate } from '@/lib/utils'
import type { AddressResponse, ClothingType, OrderResponse, PricingCell, ServiceCategory } from '@/types'

type QuantityMap = Record<string, number>

export function OrderWizard() {
  const router = useRouter()
  const token = useAuthStore((state) => state.accessToken)
  const [step, setStep] = useState(1)
  const [quantities, setQuantities] = useState<QuantityMap>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [addresses, setAddresses] = useState<AddressResponse[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [clothingTypes, setClothingTypes] = useState<ClothingType[]>([])
  const [pricing, setPricing] = useState<PricingCell[]>([])
  const [pickupAddressId, setPickupAddressId] = useState('')
  const [deliveryAddressId, setDeliveryAddressId] = useState('')
  const [pickupDate, setPickupDate] = useState(isoDate(1))
  const [deliveryDate, setDeliveryDate] = useState(isoDate(3))
  const [pickupSlot, setPickupSlot] = useState('10:00-12:00')
  const [deliverySlot, setDeliverySlot] = useState('14:00-18:00')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    async function load() {
      try {
        const [nextAddresses, nextCategories, nextClothingTypes, nextPricing] = await Promise.all([
          apiFetch<AddressResponse[]>('/users/me/addresses', { token }),
          apiFetch<ServiceCategory[]>(endpoints.categories),
          apiFetch<ClothingType[]>(endpoints.clothingTypes),
          apiFetch<PricingCell[]>(endpoints.pricing)
        ])
        setAddresses(nextAddresses)
        setCategories(nextCategories)
        setClothingTypes(nextClothingTypes)
        setPricing(nextPricing)
        const defaultAddress = nextAddresses.find((address) => address.defaultAddress) ?? nextAddresses[0]
        if (defaultAddress) {
          setPickupAddressId(defaultAddress.id)
          setDeliveryAddressId(defaultAddress.id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load order data')
      }
    }

    void load()
  }, [token])

  const decoratedClothingTypes = useMemo(() => decorateClothingTypes(clothingTypes), [clothingTypes])
  const selectedItems = useMemo(() => {
    return pricing
      .map((cell) => ({ ...cell, quantity: quantities[cell.id] ?? 0 }))
      .filter((cell) => cell.quantity > 0)
  }, [pricing, quantities])

  const total = selectedItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)

  function adjust(id: string, delta: number) {
    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, (current[id] ?? 0) + delta)
    }))
  }

  async function addAddress() {
    if (!token || !newAddress.trim()) return
    const saved = await apiFetch<AddressResponse>('/users/me/addresses', {
      method: 'POST',
      token,
      body: {
        label: addresses.length ? 'Other' : 'Home',
        addressLine1: newAddress,
        area: 'Dhaka',
        city: 'Dhaka',
        defaultAddress: addresses.length === 0
      }
    })
    setAddresses((current) => [...current, saved])
    setPickupAddressId((current) => current || saved.id)
    setDeliveryAddressId((current) => current || saved.id)
    setNewAddress('')
  }

  async function placeOrder() {
    if (!token) return
    if (!pickupAddressId || !deliveryAddressId) {
      setError('Select pickup and delivery addresses')
      setStep(1)
      return
    }
    if (!selectedItems.length) {
      setError('Add at least one item')
      setStep(3)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const order = await apiFetch<OrderResponse>('/orders', {
        method: 'POST',
        token,
        body: {
          pickupAddressId,
          deliveryAddressId,
          preferredPickupDate: pickupDate,
          preferredPickupTimeSlot: pickupSlot,
          preferredDeliveryDate: deliveryDate,
          preferredDeliveryTimeSlot: deliverySlot,
          specialInstructions,
          items: selectedItems.map((item) => ({
            clothingTypeId: item.clothingTypeId,
            serviceCategoryId: item.serviceCategoryId,
            quantity: item.quantity,
            notes: notes[item.clothingTypeId] ?? ''
          }))
        }
      })
      router.push(`/customer/orders/${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RequireAuth roles={['customer']}>
      <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
        <section className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStep(item)}
                className={`tap-target rounded-lg px-4 py-2 text-sm font-semibold ${step === item ? 'bg-ironman-red text-white' : 'bg-ironman-navy-50 text-ironman-navy'}`}
              >
                Step {item}
              </button>
            ))}
          </div>

          {error ? <p className="mt-4 rounded-lg bg-ironman-red-50 px-3 py-2 text-sm font-semibold text-ironman-red">{error}</p> : null}

          {step === 1 || step === 2 ? (
            <div className="mt-6">
              <h2 className="text-xl font-bold text-ironman-navy">{step === 1 ? 'Pickup address' : 'Delivery address'}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {addresses.map((address) => {
                  const selected = (step === 1 ? pickupAddressId : deliveryAddressId) === address.id
                  return (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => step === 1 ? setPickupAddressId(address.id) : setDeliveryAddressId(address.id)}
                      className={`focus-ring rounded-lg border p-4 text-left ${selected ? 'border-ironman-red bg-ironman-red-50' : 'border-ironman-navy-100 bg-white'}`}
                    >
                      <p className="font-bold text-ironman-navy">{address.label}</p>
                      <p className="mt-2 text-sm text-gray-600">{address.addressLine1}, {address.area}, {address.city}</p>
                    </button>
                  )
                })}
              </div>
              <div className="mt-4 flex gap-2">
                <input className="tap-target min-w-0 flex-1 rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Add address" value={newAddress} onChange={(event) => setNewAddress(event.target.value)} />
                <button className="tap-target rounded-lg bg-ironman-navy px-4 py-2 font-semibold text-white" type="button" onClick={addAddress}>Add</button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="mt-6 space-y-4">
              {decoratedClothingTypes.map((clothing) => (
                <article key={clothing.id} className="rounded-lg border border-ironman-navy-100 p-4">
                  <h2 className="text-lg font-bold text-ironman-navy">{clothing.name}</h2>
                  <div className="mt-4 divide-y divide-ironman-navy-100 rounded-lg border border-ironman-navy-100">
                    {categories.map((category) => {
                      const cell = pricing.find((item) => item.clothingTypeId === clothing.id && item.serviceCategoryId === category.id)
                      if (!cell) return null
                      const quantity = quantities[cell.id] ?? 0
                      return (
                        <div key={category.id} className="grid grid-cols-[1fr_auto] items-center gap-3 p-3">
                          <div>
                            <p className="font-semibold text-ironman-navy">{category.name}</p>
                            <p className="text-sm text-gray-500">{formatBdt(Number(cell.price))} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="tap-target focus-ring rounded-lg border border-ironman-navy-100 p-2" type="button" onClick={() => adjust(cell.id, -1)} aria-label={`Decrease ${clothing.name} ${category.name}`}>
                              <Minus className="h-4 w-4" aria-hidden />
                            </button>
                            <span className="w-8 text-center font-bold text-ironman-navy">{quantity}</span>
                            <button className="tap-target focus-ring rounded-lg bg-ironman-red p-2 text-white" type="button" onClick={() => adjust(cell.id, 1)} aria-label={`Increase ${clothing.name} ${category.name}`}>
                              <Plus className="h-4 w-4" aria-hidden />
                            </button>
                            <span className="hidden w-24 text-right font-semibold text-ironman-navy sm:inline">{formatBdt(Number(cell.price) * quantity)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <input
                    className="tap-target mt-3 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring"
                    placeholder="Notes"
                    value={notes[clothing.id] ?? ''}
                    onChange={(event) => setNotes((current) => ({ ...current, [clothing.id]: event.target.value }))}
                  />
                </article>
              ))}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Pickup date</span>
                <input className="tap-target mt-2 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" type="date" value={pickupDate} onChange={(event) => setPickupDate(event.target.value)} />
              </label>
              <label>
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Pickup slot</span>
                <select className="tap-target mt-2 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" value={pickupSlot} onChange={(event) => setPickupSlot(event.target.value)}>
                  <option>10:00-12:00</option>
                  <option>14:00-18:00</option>
                  <option>18:00-20:00</option>
                </select>
              </label>
              <label>
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Delivery date</span>
                <input className="tap-target mt-2 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} />
              </label>
              <label>
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Delivery slot</span>
                <select className="tap-target mt-2 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" value={deliverySlot} onChange={(event) => setDeliverySlot(event.target.value)}>
                  <option>10:00-12:00</option>
                  <option>14:00-18:00</option>
                  <option>18:00-20:00</option>
                </select>
              </label>
              <label className="md:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Special instructions</span>
                <textarea className="mt-2 min-h-24 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" value={specialInstructions} onChange={(event) => setSpecialInstructions(event.target.value)} />
              </label>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="mt-6">
              <h2 className="text-xl font-bold text-ironman-navy">Review order</h2>
              <div className="mt-4 space-y-2">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex justify-between rounded-lg bg-ironman-navy-50 px-3 py-2 text-sm">
                    <span>{item.quantity}x {item.clothingTypeName} {item.serviceCategoryName}</span>
                    <span className="font-semibold text-ironman-navy">{formatBdt(Number(item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <aside className="sticky bottom-0 top-20 h-fit rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-ironman-navy">Running Total</h2>
          <div className="mt-4 space-y-2">
            {selectedItems.length ? selectedItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.clothingTypeName} {item.serviceCategoryName}</span>
                <span>{formatBdt(Number(item.price) * item.quantity)}</span>
              </div>
            )) : <p className="text-sm text-gray-500">No items selected</p>}
          </div>
          <div className="mt-4 border-t border-ironman-navy-100 pt-4">
            <div className="flex justify-between text-xl font-bold text-ironman-navy">
              <span>Total</span>
              <span>{formatBdt(total)}</span>
            </div>
            <button className="tap-target focus-ring mt-4 w-full rounded-lg bg-ironman-red px-4 py-3 font-semibold text-white disabled:opacity-70" type="button" onClick={placeOrder} disabled={loading}>
              {loading ? 'Placing...' : 'Place Order'}
            </button>
          </div>
        </aside>
      </div>
    </RequireAuth>
  )
}
