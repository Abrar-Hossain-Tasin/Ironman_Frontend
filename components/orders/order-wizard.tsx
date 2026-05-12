'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  ClipboardCheck,
  CreditCard,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  QrCode,
  ShoppingBag
} from 'lucide-react'
import { RequireAuth } from '@/components/auth/require-auth'
import { apiFetch, endpoints } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { decorateClothingTypes } from '@/lib/catalog'
import { formatBdt, isoDate } from '@/lib/utils'
import type { AddressResponse, ClothingType, OrderResponse, PaymentMethod, PricingCell, ServiceCategory } from '@/types'

type QuantityMap = Record<string, number>

const steps = [
  { id: 1, label: 'Pickup', icon: MapPin },
  { id: 2, label: 'Delivery', icon: MapPin },
  { id: 3, label: 'Items', icon: ShoppingBag },
  { id: 4, label: 'Schedule', icon: CalendarClock },
  { id: 5, label: 'Review', icon: ClipboardCheck }
] as const

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
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
  const pickupAddress = addresses.find((address) => address.id === pickupAddressId)
  const deliveryAddress = addresses.find((address) => address.id === deliveryAddressId)
  const blockedStep = firstInvalidStep()
  const readyToPlace = blockedStep === null
  const progressPercent = ((Math.max(step, highestAvailableStep()) - 1) / (steps.length - 1)) * 100

  function stepError(stepId: number) {
    if (stepId === 1) {
      if (!addresses.length) return 'Add a pickup address before continuing'
      if (!pickupAddressId || !pickupAddress) return 'Select a pickup address'
    }

    if (stepId === 2) {
      if (!addresses.length) return 'Add a delivery address before continuing'
      if (!deliveryAddressId || !deliveryAddress) return 'Select a delivery address'
    }

    if (stepId === 3) {
      if (!pricing.length) return 'Pricing is still loading. Try again in a moment'
      if (!selectedItems.length) return 'Add at least one laundry item'
    }

    if (stepId === 4) {
      const today = isoDate(0)
      if (!pickupDate) return 'Select a pickup date'
      if (!pickupSlot) return 'Select a pickup time slot'
      if (!deliveryDate) return 'Select a delivery date'
      if (!deliverySlot) return 'Select a delivery time slot'
      if (pickupDate < today) return 'Pickup date cannot be in the past'
      if (deliveryDate < pickupDate) return 'Delivery date cannot be before pickup date'
    }

    return null
  }

  function firstInvalidStep(limit = 4) {
    for (let index = 1; index <= limit; index += 1) {
      if (stepError(index)) return index
    }
    return null
  }

  function highestAvailableStep() {
    const invalid = firstInvalidStep()
    return invalid ?? steps.length
  }

  function goToStep(targetStep: number) {
    if (targetStep <= step) {
      setStep(targetStep)
      setError(null)
      return
    }

    const invalid = firstInvalidStep(targetStep - 1)
    if (invalid) {
      setStep(invalid)
      setError(stepError(invalid))
      return
    }

    setStep(targetStep)
    setError(null)
  }

  function nextStep() {
    const currentError = stepError(step)
    if (currentError) {
      setError(currentError)
      return
    }
    setStep((current) => Math.min(5, current + 1))
    setError(null)
  }

  function previousStep() {
    setStep((current) => Math.max(1, current - 1))
    setError(null)
  }

  function adjust(id: string, delta: number) {
    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, (current[id] ?? 0) + delta)
    }))
  }

  async function addAddress() {
    if (!token) return
    if (!newAddress.trim()) {
      setError('Enter an address before adding it')
      return
    }

    const saved = await apiFetch<AddressResponse>('/users/me/addresses', {
      method: 'POST',
      token,
      body: {
        label: addresses.length ? 'Other' : 'Home',
        addressLine1: newAddress.trim(),
        area: 'Dhaka',
        city: 'Dhaka',
        defaultAddress: addresses.length === 0
      }
    })
    setAddresses((current) => [...current, saved])
    setPickupAddressId((current) => current || saved.id)
    setDeliveryAddressId((current) => current || saved.id)
    setNewAddress('')
    setError(null)
  }

  async function placeOrder() {
    if (!token) return
    const invalid = firstInvalidStep()
    if (invalid) {
      setStep(invalid)
      setError(stepError(invalid))
      return
    }

    if (step !== 5) {
      setStep(5)
      setError(null)
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
          paymentMethod,
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
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Order progress</p>
                <h2 className="mt-1 text-xl font-bold text-ironman-navy">{steps[step - 1].label}</h2>
              </div>
              <span className="rounded-full bg-ironman-navy-50 px-3 py-1 text-sm font-semibold text-ironman-navy">
                Step {step} of {steps.length}
              </span>
            </div>

            <div className="relative mt-5">
              <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-ironman-navy-100" />
              <div className="absolute left-0 top-5 h-1 rounded-full bg-ironman-red transition-all" style={{ width: `${progressPercent}%` }} />
              <div className="relative grid grid-cols-5 gap-2">
                {steps.map(({ id, label, icon: Icon }) => {
                  const complete = id < step && !stepError(id)
                  const locked = id > highestAvailableStep()
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => goToStep(id)}
                      aria-current={step === id ? 'step' : undefined}
                      disabled={locked}
                      className="group flex min-w-0 flex-col items-center gap-2 text-center disabled:cursor-not-allowed"
                    >
                      <span
                        className={`grid h-10 w-10 place-items-center rounded-full border text-sm font-bold transition ${
                          step === id
                            ? 'border-ironman-red bg-ironman-red text-white'
                            : complete
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : locked
                                ? 'border-ironman-navy-100 bg-white text-gray-400'
                                : 'border-ironman-navy-100 bg-white text-ironman-navy'
                        }`}
                      >
                        {complete ? <Check className="h-5 w-5" aria-hidden /> : <Icon className="h-5 w-5" aria-hidden />}
                      </span>
                      <span className={`truncate text-xs font-semibold ${locked ? 'text-gray-400' : 'text-ironman-navy'}`}>{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {error ? <p className="mb-4 rounded-lg bg-ironman-red-50 px-3 py-2 text-sm font-semibold text-ironman-red">{error}</p> : null}

          {step === 1 ? (
            <AddressStep
              title="Pickup address"
              selectedId={pickupAddressId}
              addresses={addresses}
              onSelect={setPickupAddressId}
              newAddress={newAddress}
              setNewAddress={setNewAddress}
              addAddress={addAddress}
            />
          ) : null}

          {step === 2 ? (
            <AddressStep
              title="Delivery address"
              selectedId={deliveryAddressId}
              addresses={addresses}
              onSelect={setDeliveryAddressId}
              newAddress={newAddress}
              setNewAddress={setNewAddress}
              addAddress={addAddress}
            />
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
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
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Pickup date</span>
                <input className="tap-target mt-2 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" type="date" min={isoDate(0)} value={pickupDate} onChange={(event) => setPickupDate(event.target.value)} />
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
                <input className="tap-target mt-2 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" type="date" min={pickupDate || isoDate(0)} value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} />
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
            <div>
              <h2 className="text-xl font-bold text-ironman-navy">Review order</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <ReviewBlock title="Pickup" value={pickupAddress ? addressText(pickupAddress) : 'Not selected'} onEdit={() => goToStep(1)} />
                <ReviewBlock title="Delivery" value={deliveryAddress ? addressText(deliveryAddress) : 'Not selected'} onEdit={() => goToStep(2)} />
                <ReviewBlock title="Pickup time" value={`${pickupDate} ${pickupSlot}`} onEdit={() => goToStep(4)} />
                <ReviewBlock title="Delivery time" value={`${deliveryDate} ${deliverySlot}`} onEdit={() => goToStep(4)} />
              </div>

              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Payment method</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <PaymentMethodButton
                    active={paymentMethod === 'cod'}
                    icon={CreditCard}
                    title="Pay delivery man"
                    body="Customer pays cash or direct handover to delivery staff. The delivery man confirms receipt in the app."
                    onClick={() => setPaymentMethod('cod')}
                  />
                  <PaymentMethodButton
                    active={paymentMethod === 'online'}
                    icon={QrCode}
                    title="Merchant bKash QR"
                    body="Customer scans the company merchant QR and submits the bKash transaction ID from the order page."
                    onClick={() => setPaymentMethod('online')}
                  />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex justify-between rounded-lg bg-ironman-navy-50 px-3 py-2 text-sm">
                    <span>{item.quantity}x {item.clothingTypeName} {item.serviceCategoryName}</span>
                    <span className="font-semibold text-ironman-navy">{formatBdt(Number(item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              {specialInstructions ? <p className="mt-4 rounded-lg bg-ironman-navy-50 px-3 py-2 text-sm text-gray-700">{specialInstructions}</p> : null}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ironman-navy-100 pt-5">
            <button
              className="tap-target focus-ring inline-flex items-center gap-2 rounded-lg border border-ironman-navy-100 px-4 py-2 font-semibold text-ironman-navy disabled:opacity-50"
              type="button"
              onClick={previousStep}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </button>
            {step < 5 ? (
              <button className="tap-target focus-ring inline-flex items-center gap-2 rounded-lg bg-ironman-red px-5 py-2 font-semibold text-white" type="button" onClick={nextStep}>
                Continue
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            ) : (
              <button className="tap-target focus-ring inline-flex items-center gap-2 rounded-lg bg-ironman-red px-5 py-2 font-semibold text-white disabled:opacity-70" type="button" onClick={placeOrder} disabled={loading || !readyToPlace}>
                <PackageCheck className="h-4 w-4" aria-hidden />
                {loading ? 'Placing...' : 'Place order'}
              </button>
            )}
          </div>
        </section>

        <aside className="sticky bottom-0 top-20 h-fit rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-bold text-ironman-navy">Order summary</h2>
          <div className="mt-4 space-y-2">
            {selectedItems.length ? selectedItems.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm">
                <span>{item.quantity}x {item.clothingTypeName} {item.serviceCategoryName}</span>
                <span className="font-semibold text-ironman-navy">{formatBdt(Number(item.price) * item.quantity)}</span>
              </div>
            )) : <p className="text-sm text-gray-500">No items selected</p>}
          </div>
          <div className="mt-4 border-t border-ironman-navy-100 pt-4">
            <div className="flex justify-between text-xl font-bold text-ironman-navy">
              <span>Total</span>
              <span>{formatBdt(total)}</span>
            </div>
            {blockedStep ? (
              <button className="tap-target focus-ring mt-4 w-full rounded-lg bg-ironman-navy px-4 py-3 font-semibold text-white" type="button" onClick={() => goToStep(blockedStep)}>
                Complete {steps[blockedStep - 1].label}
              </button>
            ) : (
              <button className="tap-target focus-ring mt-4 w-full rounded-lg bg-ironman-red px-4 py-3 font-semibold text-white disabled:opacity-70" type="button" onClick={() => goToStep(5)} disabled={step === 5}>
                Review order
              </button>
            )}
          </div>
        </aside>
      </div>
    </RequireAuth>
  )
}

type AddressStepProps = {
  title: string
  selectedId: string
  addresses: AddressResponse[]
  onSelect: (id: string) => void
  newAddress: string
  setNewAddress: (value: string) => void
  addAddress: () => void
}

function AddressStep({ title, selectedId, addresses, onSelect, newAddress, setNewAddress, addAddress }: AddressStepProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-ironman-navy">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {addresses.map((address) => {
          const selected = selectedId === address.id
          return (
            <button
              key={address.id}
              type="button"
              onClick={() => onSelect(address.id)}
              className={`focus-ring rounded-lg border p-4 text-left ${selected ? 'border-ironman-red bg-ironman-red-50' : 'border-ironman-navy-100 bg-white'}`}
            >
              <p className="font-bold text-ironman-navy">{address.label}</p>
              <p className="mt-2 text-sm text-gray-600">{addressText(address)}</p>
            </button>
          )
        })}
      </div>
      <div className="mt-4 flex gap-2">
        <input className="tap-target min-w-0 flex-1 rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Add address" value={newAddress} onChange={(event) => setNewAddress(event.target.value)} />
        <button className="tap-target rounded-lg bg-ironman-navy px-4 py-2 font-semibold text-white disabled:opacity-60" type="button" onClick={addAddress} disabled={!newAddress.trim()}>Add</button>
      </div>
    </div>
  )
}

function ReviewBlock({ title, value, onEdit }: { title: string; value: string; onEdit: () => void }) {
  return (
    <div className="rounded-lg border border-ironman-navy-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{title}</p>
          <p className="mt-2 text-sm font-semibold text-ironman-navy">{value}</p>
        </div>
        <button className="tap-target focus-ring rounded-lg border border-ironman-navy-100 px-3 py-1 text-sm font-semibold text-ironman-navy" type="button" onClick={onEdit}>
          Edit
        </button>
      </div>
    </div>
  )
}

function PaymentMethodButton({
  active,
  icon: Icon,
  title,
  body,
  onClick
}: {
  active: boolean
  icon: typeof CreditCard
  title: string
  body: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring rounded-lg border p-4 text-left transition ${
        active ? 'border-ironman-red bg-ironman-red-50' : 'border-ironman-navy-100 bg-white'
      }`}
    >
      <span className="flex items-center gap-2 font-bold text-ironman-navy">
        <Icon className="h-5 w-5 text-ironman-red" aria-hidden />
        {title}
      </span>
      <span className="mt-2 block text-sm text-gray-600">{body}</span>
    </button>
  )
}

function addressText(address: AddressResponse) {
  return [address.addressLine1, address.addressLine2, address.area, address.city, address.postalCode]
    .filter(Boolean)
    .join(', ')
}
