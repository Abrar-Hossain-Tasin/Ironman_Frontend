// 'use client'

// import { FormEvent, useEffect, useMemo, useState } from 'react'
// import { RequireAuth } from '@/components/auth/require-auth'
// import { PricingTable } from '@/components/ui/pricing-table'
// import { apiFetch, endpoints } from '@/lib/api'
// import { useAuthStore } from '@/lib/auth-store'
// import { decorateCategories, decorateClothingTypes } from '@/lib/catalog'
// import type { ClothingType, PricingCell, ServiceCategory } from '@/types'

// export function AdminPricing() {
//   const token = useAuthStore((state) => state.accessToken)
//   const [categories, setCategories] = useState<ServiceCategory[]>([])
//   const [clothingTypes, setClothingTypes] = useState<ClothingType[]>([])
//   const [pricing, setPricing] = useState<PricingCell[]>([])
//   const [message, setMessage] = useState<string | null>(null)

//   async function load() {
//     const [nextCategories, nextClothingTypes, nextPricing] = await Promise.all([
//       apiFetch<ServiceCategory[]>(endpoints.categories),
//       apiFetch<ClothingType[]>(endpoints.clothingTypes),
//       apiFetch<PricingCell[]>(endpoints.pricing)
//     ])
//     setCategories(nextCategories)
//     setClothingTypes(nextClothingTypes)
//     setPricing(nextPricing)
//   }

//   useEffect(() => {
//     void load()
//   }, [])

//   async function savePrice(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault()
//     if (!token) return
//     const form = new FormData(event.currentTarget)
//     await apiFetch('/admin/pricing', {
//       method: 'POST',
//       token,
//       body: {
//         serviceCategoryId: String(form.get('serviceCategoryId') ?? ''),
//         clothingTypeId: String(form.get('clothingTypeId') ?? ''),
//         price: Number(form.get('price') ?? 0),
//         effectiveFrom: String(form.get('effectiveFrom') ?? new Date().toISOString().slice(0, 10))
//       }
//     })
//     setMessage('Price saved')
//     await load()
//   }

//   const decoratedCategories = useMemo(() => decorateCategories(categories, pricing), [categories, pricing])
//   const decoratedClothingTypes = useMemo(() => decorateClothingTypes(clothingTypes), [clothingTypes])

//   return (
//     <RequireAuth roles={['admin']}>
//       <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
//         <PricingTable categories={decoratedCategories} clothingTypes={decoratedClothingTypes} pricing={pricing} />
//         <form className="h-fit rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft" onSubmit={savePrice}>
//           <h2 className="text-xl font-bold text-ironman-navy">Set Price</h2>
//           <div className="mt-4 space-y-3">
//             <select name="serviceCategoryId" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" required>
//               <option value="">Service</option>
//               {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
//             </select>
//             <select name="clothingTypeId" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" required>
//               <option value="">Clothing</option>
//               {clothingTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
//             </select>
//             <input name="price" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="BDT amount" type="number" min="0" required />
//             <input name="effectiveFrom" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
//           </div>
//           {message ? <p className="mt-3 rounded-lg bg-ironman-navy-50 px-3 py-2 text-sm font-semibold text-ironman-navy">{message}</p> : null}
//           <button className="tap-target mt-4 w-full rounded-lg bg-ironman-red px-4 py-2 font-semibold text-white" type="submit">Save Price</button>
//         </form>
//       </div>
//     </RequireAuth>
//   )
// }

// components/admin/admin-pricing.tsx
// 'use client'

// import { FormEvent, useEffect, useMemo, useState } from 'react'
// // Added Zap and others to the import list
// import { Trash2, History, LayoutGrid, CheckCircle2, XCircle, Zap } from 'lucide-react'
// import { RequireAuth } from '@/components/auth/require-auth'
// import { PricingTable } from '@/components/ui/pricing-table'
// import { apiFetch, endpoints } from '@/lib/api'
// import { useAuthStore } from '@/lib/auth-store'
// import { decorateCategories, decorateClothingTypes } from '@/lib/catalog'
// import { formatBdt } from '@/lib/utils'
// import type { ClothingType, PricingCell, ServiceCategory } from '@/types'

// export function AdminPricing() {
//   const token = useAuthStore((state) => state.accessToken)
//   const [categories, setCategories] = useState<ServiceCategory[]>([])
//   const [clothingTypes, setClothingTypes] = useState<ClothingType[]>([])
//   const [pricing, setPricing] = useState<PricingCell[]>([])
//   const [history, setHistory] = useState<PricingCell[]>([])
//   const [view, setView] = useState<'grid' | 'history'>('grid')
//   const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
//   const [loading, setLoading] = useState(false)

//   async function load() {
//     setLoading(true)
//     try {
//       const [nextCategories, nextClothingTypes, nextPricing, nextHistory] = await Promise.all([
//         apiFetch<ServiceCategory[]>(endpoints.categories),
//         apiFetch<ClothingType[]>(endpoints.clothingTypes),
//         apiFetch<PricingCell[]>(endpoints.pricing),
//         apiFetch<PricingCell[]>(endpoints.adminPricingHistory, { token })
//       ])
//       setCategories(nextCategories)
//       setClothingTypes(nextClothingTypes)
//       setPricing(nextPricing)
//       setHistory(nextHistory)
//     } catch (err) {
//       console.error('Load failed:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (token) void load()
//   }, [token])

//   async function savePrice(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault()
//     if (!token) return
//     const form = new FormData(event.currentTarget)
    
//     try {
//       await apiFetch(endpoints.adminPricing, {
//         method: 'POST',
//         token,
//         body: {
//           serviceCategoryId: String(form.get('serviceCategoryId')),
//           clothingTypeId: String(form.get('clothingTypeId')),
//           price: Number(form.get('price')),
//           effectiveFrom: String(form.get('effectiveFrom'))
//         }
//       })
//       setMessage({ text: 'Price updated successfully', type: 'success' })
//       event.currentTarget.reset()
//       await load()
//     } catch (err) {
//       setMessage({ text: 'Failed to update price', type: 'error' })
//     }
//   }

//   async function deactivatePrice(id: string) {
//     if (!token || !confirm('Are you sure you want to deactivate this price?')) return
//     try {
//       await apiFetch(endpoints.adminDeactivatePricing(id), {
//         method: 'DELETE',
//         token
//       })
//       setMessage({ text: 'Price deactivated', type: 'success' })
//       await load()
//     } catch (err) {
//       setMessage({ text: 'Deactivation failed', type: 'error' })
//     }
//   }

//   const decoratedCategories = useMemo(() => decorateCategories(categories, pricing), [categories, pricing])
//   const decoratedClothingTypes = useMemo(() => decorateClothingTypes(clothingTypes), [clothingTypes])

//   return (
//     <RequireAuth roles={['admin']}>
//       <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
//         <section className="space-y-4">
//           {/* View Toggle */}
//           <div className="flex gap-2 rounded-xl bg-ironman-navy-50 p-1 w-fit">
//             <button 
//               onClick={() => setView('grid')}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'grid' ? 'bg-white text-ironman-navy shadow-sm' : 'text-gray-500 hover:text-ironman-navy'}`}
//             >
//               <LayoutGrid className="h-4 w-4" /> Current Grid
//             </button>
//             <button 
//               onClick={() => setView('history')}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'history' ? 'bg-white text-ironman-navy shadow-sm' : 'text-gray-500 hover:text-ironman-navy'}`}
//             >
//               <History className="h-4 w-4" /> Price History
//             </button>
//           </div>

//           {loading && <p className="text-sm text-gray-500 animate-pulse">Synchronizing with server...</p>}

//           {view === 'grid' ? (
//             <PricingTable 
//               categories={decoratedCategories} 
//               clothingTypes={decoratedClothingTypes} 
//               pricing={pricing} 
//             />
//           ) : (
//             <div className="overflow-x-auto rounded-xl border border-ironman-navy-100 bg-white shadow-soft">
//               <table className="w-full text-sm text-left">
//                 <thead className="bg-ironman-navy text-white">
//                   <tr>
//                     <th className="px-4 py-4">Clothing</th>
//                     <th className="px-4 py-4">Service</th>
//                     <th className="px-4 py-4">Price</th>
//                     <th className="px-4 py-4">Effective From</th>
//                     <th className="px-4 py-4 text-right">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-ironman-navy-50">
//                   {history.map((item) => (
//                     <tr key={item.id} className="hover:bg-ironman-navy-50/50 transition-colors">
//                       <td className="px-4 py-4 font-bold text-ironman-navy">{item.clothingTypeName}</td>
//                       <td className="px-4 py-4">{item.serviceCategoryName}</td>
//                       <td className="px-4 py-4 font-mono font-bold text-ironman-red">{formatBdt(item.price)}</td>
//                       <td className="px-4 py-4 text-gray-500">{item.effectiveFrom}</td>
//                       <td className="px-4 py-4 text-right">
//                         <button 
//                           onClick={() => deactivatePrice(item.id)}
//                           className="p-2 text-gray-400 hover:text-ironman-red transition-colors"
//                           title="Deactivate Price"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                   {history.length === 0 && !loading && (
//                     <tr>
//                       <td colSpan={5} className="px-4 py-10 text-center text-gray-400">No pricing history found.</td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </section>

//         {/* Update Form */}
//         <aside>
//           <form className="sticky top-6 rounded-2xl border border-ironman-navy-100 bg-white p-6 shadow-luxury" onSubmit={savePrice}>
//             <div className="flex items-center gap-3 mb-6">
//               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ironman-red/10 text-ironman-red">
//                 <Zap className="h-5 w-5" />
//               </div>
//               <h2 className="text-xl font-bold text-ironman-navy">Update Pricing</h2>
//             </div>

//             <div className="space-y-4">
//               <div className="space-y-1.5">
//                 <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Service Category</label>
//                 <select name="serviceCategoryId" className="w-full rounded-xl border border-ironman-navy-100 bg-ironman-navy-50 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-ironman-red outline-none" required>
//                   <option value="">Select Service</option>
//                   {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
//                 </select>
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Clothing Type</label>
//                 <select name="clothingTypeId" className="w-full rounded-xl border border-ironman-navy-100 bg-ironman-navy-50 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-ironman-red outline-none" required>
//                   <option value="">Select Clothing</option>
//                   {clothingTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
//                 </select>
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Price (BDT)</label>
//                 <input name="price" type="number" step="0.01" className="w-full rounded-xl border border-ironman-navy-100 bg-ironman-navy-50 px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-ironman-red outline-none" placeholder="0.00" required />
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Effective From</label>
//                 <input name="effectiveFrom" type="date" className="w-full rounded-xl border border-ironman-navy-100 bg-ironman-navy-50 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-ironman-red outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
//               </div>
//             </div>

//             {message && (
//               <div className={`mt-6 flex items-center gap-2 rounded-xl p-3 text-xs font-bold ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
//                 {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
//                 {message.text}
//               </div>
//             )}

//             <button 
//               type="submit" 
//               className="mt-6 w-full rounded-xl bg-ironman-red py-4 font-bold text-white shadow-glow hover:bg-ironman-red-dark transition-all active:scale-[0.98]"
//             >
//               Update Live Price
//             </button>
//           </form>
//         </aside>
//       </div>
//     </RequireAuth>
//   )
// }

// components/admin/admin-pricing.tsx
'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Trash2, History, LayoutGrid, CheckCircle2, XCircle, Zap } from 'lucide-react'
import { RequireAuth } from '@/components/auth/require-auth'
import { PricingTable } from '@/components/ui/pricing-table'
import { apiFetch, endpoints } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { decorateCategories, decorateClothingTypes } from '@/lib/catalog'
import { formatBdt } from '@/lib/utils'
import type { ClothingType, PricingCell, ServiceCategory } from '@/types'

export function AdminPricing() {
  const token = useAuthStore((state) => state.accessToken)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [clothingTypes, setClothingTypes] = useState<ClothingType[]>([])
  const [pricing, setPricing] = useState<PricingCell[]>([])
  const [history, setHistory] = useState<PricingCell[]>([])
  const [view, setView] = useState<'grid' | 'history'>('grid')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [nextCategories, nextClothingTypes, nextPricing, nextHistory] = await Promise.all([
        apiFetch<ServiceCategory[]>(endpoints.categories),
        apiFetch<ClothingType[]>(endpoints.clothingTypes),
        apiFetch<PricingCell[]>(endpoints.pricing),
        apiFetch<PricingCell[]>(endpoints.adminPricingHistory, { token })
      ])
      setCategories(nextCategories)
      setClothingTypes(nextClothingTypes)
      setPricing(nextPricing)
      setHistory(nextHistory)
    } catch (err) {
      console.error('Load failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) void load()
  }, [token])

  async function savePrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return

    // FIX: capture the form element reference BEFORE any await.
    // React nullifies event.currentTarget after the handler yields,
    // so event.currentTarget.reset() would throw a TypeError after
    // the await — landing in the catch and showing a false error.
    const formEl = event.currentTarget
    const form = new FormData(formEl)

    try {
      await apiFetch(endpoints.adminPricing, {
        method: 'POST',
        token,
        body: {
          serviceCategoryId: String(form.get('serviceCategoryId')),
          clothingTypeId: String(form.get('clothingTypeId')),
          price: Number(form.get('price')),
          effectiveFrom: String(form.get('effectiveFrom'))
        }
      })
      setMessage({ text: 'Price updated successfully', type: 'success' })
      formEl.reset() // safe: using the captured reference, not event.currentTarget
      await load()
    } catch (err) {
      setMessage({ text: 'Failed to update price', type: 'error' })
    }
  }

  async function deactivatePrice(id: string) {
    if (!token || !confirm('Are you sure you want to deactivate this price?')) return
    try {
      await apiFetch(endpoints.adminDeactivatePricing(id), {
        method: 'DELETE',
        token
      })
      setMessage({ text: 'Price deactivated', type: 'success' })
      await load()
    } catch (err) {
      setMessage({ text: 'Deactivation failed', type: 'error' })
    }
  }

  const decoratedCategories = useMemo(() => decorateCategories(categories, pricing), [categories, pricing])
  const decoratedClothingTypes = useMemo(() => decorateClothingTypes(clothingTypes), [clothingTypes])

  return (
    <RequireAuth roles={['admin']}>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          {/* View Toggle */}
          <div className="flex gap-2 rounded-xl bg-ironman-navy-50 p-1 w-fit">
            <button 
              onClick={() => setView('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'grid' ? 'bg-white text-ironman-navy shadow-sm' : 'text-gray-500 hover:text-ironman-navy'}`}
            >
              <LayoutGrid className="h-4 w-4" /> Current Grid
            </button>
            <button 
              onClick={() => setView('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'history' ? 'bg-white text-ironman-navy shadow-sm' : 'text-gray-500 hover:text-ironman-navy'}`}
            >
              <History className="h-4 w-4" /> Price History
            </button>
          </div>

          {loading && <p className="text-sm text-gray-500 animate-pulse">Synchronizing with server...</p>}

          {view === 'grid' ? (
            <PricingTable 
              categories={decoratedCategories} 
              clothingTypes={decoratedClothingTypes} 
              pricing={pricing} 
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-ironman-navy-100 bg-white shadow-soft">
              <table className="w-full text-sm text-left">
                <thead className="bg-ironman-navy text-white">
                  <tr>
                    <th className="px-4 py-4">Clothing</th>
                    <th className="px-4 py-4">Service</th>
                    <th className="px-4 py-4">Price</th>
                    <th className="px-4 py-4">Effective From</th>
                    <th className="px-4 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ironman-navy-50">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-ironman-navy-50/50 transition-colors">
                      <td className="px-4 py-4 font-bold text-ironman-navy">{item.clothingTypeName}</td>
                      <td className="px-4 py-4">{item.serviceCategoryName}</td>
                      <td className="px-4 py-4 font-mono font-bold text-ironman-red">{formatBdt(item.price)}</td>
                      <td className="px-4 py-4 text-gray-500">{item.effectiveFrom}</td>
                      <td className="px-4 py-4 text-right">
                        <button 
                          onClick={() => deactivatePrice(item.id)}
                          className="p-2 text-gray-400 hover:text-ironman-red transition-colors"
                          title="Deactivate Price"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-gray-400">No pricing history found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Update Form */}
        <aside>
          <form className="sticky top-6 rounded-2xl border border-ironman-navy-100 bg-white p-6 shadow-luxury" onSubmit={savePrice}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ironman-red/10 text-ironman-red">
                <Zap className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-ironman-navy">Update Pricing</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Service Category</label>
                <select name="serviceCategoryId" className="w-full rounded-xl border border-ironman-navy-100 bg-ironman-navy-50 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-ironman-red outline-none" required>
                  <option value="">Select Service</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Clothing Type</label>
                <select name="clothingTypeId" className="w-full rounded-xl border border-ironman-navy-100 bg-ironman-navy-50 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-ironman-red outline-none" required>
                  <option value="">Select Clothing</option>
                  {clothingTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Price (BDT)</label>
                <input name="price" type="number" step="0.01" className="w-full rounded-xl border border-ironman-navy-100 bg-ironman-navy-50 px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-ironman-red outline-none" placeholder="0.00" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Effective From</label>
                <input name="effectiveFrom" type="date" className="w-full rounded-xl border border-ironman-navy-100 bg-ironman-navy-50 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-ironman-red outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            {message && (
              <div className={`mt-6 flex items-center gap-2 rounded-xl p-3 text-xs font-bold ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {message.text}
              </div>
            )}

            <button 
              type="submit" 
              className="mt-6 w-full rounded-xl bg-ironman-red py-4 font-bold text-white shadow-glow hover:bg-ironman-red-dark transition-all active:scale-[0.98]"
            >
              Update Live Price
            </button>
          </form>
        </aside>
      </div>
    </RequireAuth>
  )
}