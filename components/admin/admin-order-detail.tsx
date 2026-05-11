// 'use client'

// import { FormEvent, useEffect, useState } from 'react'
// import { RequireAuth } from '@/components/auth/require-auth'
// import { PaymentLedger } from '@/components/payments/payment-ledger'
// import { StatusBadge } from '@/components/ui/status-badge'
// import { TrackingTimeline } from '@/components/ui/tracking-timeline'
// import { apiFetch } from '@/lib/api'
// import { useAuthStore } from '@/lib/auth-store'
// import { formatBdt } from '@/lib/utils'
// import type { AssignmentType, OrderResponse, OrderStatus, PaymentLedgerRow, TrackingEvent, UserSummary } from '@/types'

// type AdminOrderDetailProps = {
//   id: string
// }

// const statuses: OrderStatus[] = [
//   'confirmed',
//   'pickup_assigned',
//   'picked_up',
//   'in_wash',
//   'wash_complete',
//   'in_dry_clean',
//   'dry_clean_complete',
//   'waiting_for_iron',
//   'in_iron',
//   'iron_complete',
//   'ready',
//   'delivery_assigned',
//   'out_for_delivery',
//   'delivered',
//   'cancelled'
// ]

// export function AdminOrderDetail({ id }: AdminOrderDetailProps) {
//   const token = useAuthStore((state) => state.accessToken)
//   const [order, setOrder] = useState<OrderResponse | null>(null)
//   const [tracking, setTracking] = useState<TrackingEvent[]>([])
//   const [payments, setPayments] = useState<PaymentLedgerRow[]>([])
//   const [staff, setStaff] = useState<UserSummary[]>([])
//   const [message, setMessage] = useState<string | null>(null)

//   async function load() {
//     if (!token) return
//     const [nextOrder, nextTracking, nextPayments, nextStaff] = await Promise.all([
//       apiFetch<OrderResponse>(`/orders/${id}`, { token }),
//       apiFetch<TrackingEvent[]>(`/orders/${id}/tracking`, { token }),
//       apiFetch<PaymentLedgerRow[]>(`/payments/orders/${id}`, { token }),
//       apiFetch<UserSummary[]>('/admin/staff', { token })
//     ])
//     setOrder(nextOrder)
//     setTracking(nextTracking)
//     setPayments(nextPayments)
//     setStaff(nextStaff)
//   }

//   useEffect(() => {
//     void load()
//   }, [id, token])

//   async function updateStatus(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault()
//     if (!token) return
//     const form = new FormData(event.currentTarget)
//     await apiFetch(`/admin/orders/${id}/status`, {
//       method: 'PUT',
//       token,
//       body: {
//         status: String(form.get('status') ?? ''),
//         reason: String(form.get('reason') ?? '')
//       }
//     })
//     setMessage('Status updated')
//     await load()
//   }

//   async function assign(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault()
//     if (!token) return
//     const form = new FormData(event.currentTarget)
//     await apiFetch(`/admin/orders/${id}/assign`, {
//       method: 'POST',
//       token,
//       body: {
//         assignedTo: String(form.get('assignedTo') ?? ''),
//         assignmentType: String(form.get('assignmentType') ?? '') as AssignmentType,
//         notes: String(form.get('notes') ?? '')
//       }
//     })
//     setMessage('Assignment created')
//     await load()
//   }

//   return (
//     <RequireAuth roles={['admin']}>
//       {order ? (
//         <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
//           <section className="space-y-6">
//             <div className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
//               <div className="flex flex-wrap items-center justify-between gap-3">
//                 <div>
//                   <h2 className="text-xl font-bold text-ironman-navy">{order.customer.fullName}</h2>
//                   <p className="mt-1 text-sm text-gray-600">{formatBdt(Number(order.totalAmount))} total, {formatBdt(Number(order.paidAmount))} paid</p>
//                 </div>
//                 <StatusBadge status={order.status} />
//               </div>
//             </div>
//             <div className="grid gap-4 md:grid-cols-2">
//               <form className="rounded-lg border border-ironman-navy-100 bg-white p-4 shadow-soft" onSubmit={assign}>
//                 <h3 className="text-lg font-bold text-ironman-navy">Assign Staff</h3>
//                 <select name="assignmentType" className="tap-target mt-3 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" required>
//                   <option value="">Assignment type</option>
//                   <option value="pickup">Pickup</option>
//                   <option value="delivery">Delivery</option>
//                   <option value="wash">Wash</option>
//                   <option value="iron">Iron</option>
//                   <option value="dry_clean">Dry clean</option>
//                 </select>
//                 <select name="assignedTo" className="tap-target mt-3 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" required>
//                   <option value="">Select staff</option>
//                   {staff.map((person) => <option key={person.id} value={person.id}>{person.fullName} · {person.role}</option>)}
//                 </select>
//                 <input name="notes" className="tap-target mt-3 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Notes" />
//                 <button className="tap-target mt-3 w-full rounded-lg bg-ironman-red px-4 py-2 font-semibold text-white" type="submit">Assign</button>
//               </form>
//               <form className="rounded-lg border border-ironman-navy-100 bg-white p-4 shadow-soft" onSubmit={updateStatus}>
//                 <h3 className="text-lg font-bold text-ironman-navy">Override Status</h3>
//                 <select name="status" className="tap-target mt-3 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" defaultValue={order.status} required>
//                   {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
//                 </select>
//                 <input name="reason" className="tap-target mt-3 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Reason" />
//                 <button className="tap-target mt-3 w-full rounded-lg bg-ironman-navy px-4 py-2 font-semibold text-white" type="submit">Update</button>
//               </form>
//             </div>
//             {message ? <p className="rounded-lg bg-ironman-navy-50 px-3 py-2 text-sm font-semibold text-ironman-navy">{message}</p> : null}
//             <PaymentLedger payments={payments} />
//           </section>
//           <section className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
//             <TrackingTimeline events={tracking} />
//           </section>
//         </div>
//       ) : (
//         <p className="rounded-lg bg-white p-5 text-sm font-semibold text-ironman-navy shadow-soft">Loading order...</p>
//       )}
//     </RequireAuth>
//   )
// }

// 'use client'

// import { FormEvent, useEffect, useState } from 'react'
// import { RequireAuth } from '@/components/auth/require-auth'
// import { PaymentLedger } from '@/components/payments/payment-ledger'
// import { StatusBadge } from '@/components/ui/status-badge'
// import { TrackingTimeline } from '@/components/ui/tracking-timeline'
// import { apiFetch } from '@/lib/api'
// import { useAuthStore } from '@/lib/auth-store'
// import { formatBdt } from '@/lib/utils'
// import type { AssignmentType, OrderResponse, OrderStatus, PaymentLedgerRow, TrackingEvent, UserSummary } from '@/types'

// type AdminOrderDetailProps = {
//   id: string
// }

// const statuses: OrderStatus[] = [
//   'confirmed',
//   'pickup_assigned',
//   'picked_up',
//   'in_wash',
//   'wash_complete',
//   'in_dry_clean',
//   'dry_clean_complete',
//   'waiting_for_iron',
//   'in_iron',
//   'iron_complete',
//   'ready',
//   'delivery_assigned',
//   'out_for_delivery',
//   'delivered',
//   'cancelled'
// ]

// export function AdminOrderDetail({ id }: AdminOrderDetailProps) {
//   const token = useAuthStore((state) => state.accessToken)
//   const [order, setOrder] = useState<OrderResponse | null>(null)
//   const [tracking, setTracking] = useState<TrackingEvent[]>([])
//   const [payments, setPayments] = useState<PaymentLedgerRow[]>([])
//   const [staff, setStaff] = useState<UserSummary[]>([])
//   const [message, setMessage] = useState<string | null>(null)

//   async function load() {
//     if (!token) return
//     const [nextOrder, nextTracking, nextPayments, nextStaff] = await Promise.all([
//       apiFetch<OrderResponse>(`/orders/${id}`, { token }),
//       apiFetch<TrackingEvent[]>(`/orders/${id}/tracking`, { token }),
//       apiFetch<PaymentLedgerRow[]>(`/payments/orders/${id}`, { token }),
//       apiFetch<UserSummary[]>('/admin/staff', { token })
//     ])
//     setOrder(nextOrder)
//     setTracking(nextTracking)
//     setPayments(nextPayments)
//     setStaff(nextStaff)
//   }

//   useEffect(() => {
//     void load()
//   }, [id, token])

//   // --- New Confirm Order Function ---
//   async function confirmOrder() {
//     if (!token) return;
//     try {
//       await apiFetch(`/admin/orders/${id}/status`, {
//         method: 'PUT',
//         token,
//         body: {
//           status: 'confirmed',
//           reason: 'Confirmed by admin'
//         }
//       });
//       setMessage('Order confirmed! You can now assign staff.');
//       await load();
//     } catch (err) {
//       setMessage('Failed to confirm order.');
//     }
//   }

//   async function updateStatus(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault()
//     if (!token) return
//     const form = new FormData(event.currentTarget)
//     await apiFetch(`/admin/orders/${id}/status`, {
//       method: 'PUT',
//       token,
//       body: {
//         status: String(form.get('status') ?? ''),
//         reason: String(form.get('reason') ?? '')
//       }
//     })
//     setMessage('Status updated')
//     await load()
//   }

//   async function assign(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault()
//     if (!token) return
//     const form = new FormData(event.currentTarget)
//     await apiFetch(`/admin/orders/${id}/assign`, {
//       method: 'POST',
//       token,
//       body: {
//         assignedTo: String(form.get('assignedTo') ?? ''),
//         assignmentType: String(form.get('assignmentType') ?? '') as AssignmentType,
//         notes: String(form.get('notes') ?? '')
//       }
//     })
//     setMessage('Assignment created')
//     await load()
//   }

//   return (
//     <RequireAuth roles={['admin']}>
//       {order ? (
//         <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
//           <section className="space-y-6">
//             <div className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
//               <div className="flex flex-wrap items-center justify-between gap-3">
//                 <div>
//                   <h2 className="text-xl font-bold text-ironman-navy">{order.customer.fullName}</h2>
//                   <p className="mt-1 text-sm text-gray-600">{formatBdt(Number(order.totalAmount))} total, {formatBdt(Number(order.paidAmount))} paid</p>
//                 </div>
//                 <StatusBadge status={order.status} />
//               </div>
//             </div>

//             {/* --- Conditional Confirmation Button --- */}
//             {order.status === 'pending' && (
//               <button 
//                 onClick={confirmOrder}
//                 className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition-all transform hover:scale-[1.01] active:scale-95"
//               >
//                 Confirm Order & Notify Customer
//               </button>
//             )}

//             <div className="grid gap-4 md:grid-cols-2">
//               <form className={`rounded-lg border border-ironman-navy-100 bg-white p-4 shadow-soft ${order.status === 'pending' ? 'opacity-50 pointer-events-none' : ''}`} onSubmit={assign}>
//                 <h3 className="text-lg font-bold text-ironman-navy">Assign Staff</h3>
//                 <p className="text-xs text-gray-500 mb-2">Assign drivers or factory staff</p>
//                 <select name="assignmentType" className="tap-target mt-3 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" required>
//                   <option value="">Assignment type</option>
//                   <option value="pickup">Pickup</option>
//                   <option value="delivery">Delivery</option>
//                   <option value="wash">Wash</option>
//                   <option value="iron">Iron</option>
//                   <option value="dry_clean">Dry clean</option>
//                 </select>
//                 <select name="assignedTo" className="tap-target mt-3 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" required>
//                   <option value="">Select staff</option>
//                   {staff.map((person) => <option key={person.id} value={person.id}>{person.fullName} · {person.role}</option>)}
//                 </select>
//                 <input name="notes" className="tap-target mt-3 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Notes" />
//                 <button className="tap-target mt-3 w-full rounded-lg bg-ironman-red px-4 py-2 font-semibold text-white" type="submit">Assign</button>
//               </form>

//               <form className="rounded-lg border border-ironman-navy-100 bg-white p-4 shadow-soft" onSubmit={updateStatus}>
//                 <h3 className="text-lg font-bold text-ironman-navy">Override Status</h3>
//                 <p className="text-xs text-gray-500 mb-2">Manually force an order state</p>
//                 <select name="status" className="tap-target mt-3 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" defaultValue={order.status} required>
//                   {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
//                 </select>
//                 <input name="reason" className="tap-target mt-3 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Reason" />
//                 <button className="tap-target mt-3 w-full rounded-lg bg-ironman-navy px-4 py-2 font-semibold text-white" type="submit">Update</button>
//               </form>
//             </div>

//             {message ? <p className="rounded-lg bg-ironman-navy-50 px-3 py-2 text-sm font-semibold text-ironman-navy animate-in fade-in slide-in-from-top-1">{message}</p> : null}
//             <PaymentLedger payments={payments} />
//           </section>
          
//           <section className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
//             <TrackingTimeline events={tracking} />
//           </section>
//         </div>
//       ) : (
//         <p className="rounded-lg bg-white p-5 text-sm font-semibold text-ironman-navy shadow-soft">Loading order...</p>
//       )}
//     </RequireAuth>
//   )
// }

'use client'

import { FormEvent, useEffect, useState } from 'react'
import { RequireAuth } from '@/components/auth/require-auth'
import { PaymentLedger } from '@/components/payments/payment-ledger'
import { StatusBadge } from '@/components/ui/status-badge'
import { TrackingTimeline } from '@/components/ui/tracking-timeline'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { formatBdt } from '@/lib/utils'
import type { AssignmentType, OrderResponse, OrderStatus, PaymentLedgerRow, TrackingEvent, UserSummary } from '@/types'

type AdminOrderDetailProps = {
  id: string
}

const statuses: OrderStatus[] = [
  'confirmed',
  'pickup_assigned',
  'picked_up',
  'in_wash',
  'wash_complete',
  'in_dry_clean',
  'dry_clean_complete',
  'waiting_for_iron',
  'in_iron',
  'iron_complete',
  'ready',
  'delivery_assigned',
  'out_for_delivery',
  'delivered',
  'cancelled'
]

export function AdminOrderDetail({ id }: AdminOrderDetailProps) {
  const token = useAuthStore((state) => state.accessToken)
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [tracking, setTracking] = useState<TrackingEvent[]>([])
  const [payments, setPayments] = useState<PaymentLedgerRow[]>([])
  const [staff, setStaff] = useState<UserSummary[]>([])
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    if (!token) return
    const [nextOrder, nextTracking, nextPayments, nextStaff] = await Promise.all([
      apiFetch<OrderResponse>(`/orders/${id}`, { token }),
      apiFetch<TrackingEvent[]>(`/orders/${id}/tracking`, { token }),
      apiFetch<PaymentLedgerRow[]>(`/payments/orders/${id}`, { token }),
      apiFetch<UserSummary[]>('/admin/staff', { token })
    ])
    setOrder(nextOrder)
    setTracking(nextTracking)
    setPayments(nextPayments)
    setStaff(nextStaff)
  }

  useEffect(() => {
    void load()
  }, [id, token])

  async function confirmOrder() {
    if (!token) return;
    try {
      await apiFetch(`/admin/orders/${id}/status`, {
        method: 'PUT',
        token,
        body: {
          status: 'confirmed',
          reason: 'Confirmed by admin'
        }
      });
      setMessage('Order confirmed! You can now assign staff.');
      await load();
    } catch (err) {
      setMessage('Failed to confirm order.');
    }
  }

  async function updateStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    const form = new FormData(event.currentTarget)
    await apiFetch(`/admin/orders/${id}/status`, {
      method: 'PUT',
      token,
      body: {
        status: String(form.get('status') ?? ''),
        reason: String(form.get('reason') ?? '')
      }
    })
    setMessage('Status updated')
    await load()
  }

  async function assign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    const form = new FormData(event.currentTarget)
    await apiFetch(`/admin/orders/${id}/assign`, {
      method: 'POST',
      token,
      body: {
        assignedTo: String(form.get('assignedTo') ?? ''),
        assignmentType: String(form.get('assignmentType') ?? '') as AssignmentType,
        notes: String(form.get('notes') ?? '')
      }
    })
    setMessage('Assignment created')
    await load()
  }

  return (
    <RequireAuth roles={['admin']}>
      {order ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <div className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-ironman-navy">{order.customer.fullName}</h2>
                  <p className="mt-1 text-sm text-gray-600">{formatBdt(Number(order.totalAmount))} total, {formatBdt(Number(order.paidAmount))} paid</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
            </div>

            {/* Confirmation Button */}
            {order.status === 'pending' && (
              <button 
                onClick={confirmOrder}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition-all transform hover:scale-[1.01] active:scale-95"
              >
                Confirm Order & Notify Customer
              </button>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {/* Form 1: Assign Staff */}
              <form 
                className={`rounded-lg border border-ironman-navy-100 bg-white p-4 shadow-soft ${order.status === 'pending' ? 'opacity-50 pointer-events-none' : ''}`} 
                onSubmit={assign}
              >
                <h3 className="text-lg font-bold text-ironman-navy">Assign Staff</h3>
                <p className="text-xs text-gray-500 mb-2">Assign drivers or factory staff</p>
                
                <select 
                  name="assignmentType" 
                  title="Select assignment type"
                  aria-label="Assignment type"
                  className="tap-target mt-3 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" 
                  required
                >
                  <option value="">Assignment type</option>
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                  <option value="wash">Wash</option>
                  <option value="iron">Iron</option>
                  <option value="dry_clean">Dry clean</option>
                </select>

                <select 
                  name="assignedTo" 
                  title="Select staff member"
                  aria-label="Select staff member"
                  className="tap-target mt-3 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" 
                  required
                >
                  <option value="">Select staff</option>
                  {staff.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.fullName} · {person.role}
                    </option>
                  ))}
                </select>

                <input 
                  name="notes" 
                  title="Assignment notes"
                  aria-label="Assignment notes"
                  className="tap-target mt-3 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" 
                  placeholder="Notes" 
                />
                
                <button className="tap-target mt-3 w-full rounded-lg bg-ironman-red px-4 py-2 font-semibold text-white" type="submit">
                  Assign
                </button>
              </form>

              {/* Form 2: Override Status */}
              <form className="rounded-lg border border-ironman-navy-100 bg-white p-4 shadow-soft" onSubmit={updateStatus}>
                <h3 className="text-lg font-bold text-ironman-navy">Override Status</h3>
                <p className="text-xs text-gray-500 mb-2">Manually force an order state</p>
                
                <select 
                  name="status" 
                  title="Select new order status"
                  aria-label="New order status"
                  className="tap-target mt-3 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" 
                  defaultValue={order.status} 
                  required
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                <input 
                  name="reason" 
                  title="Reason for status change"
                  aria-label="Reason for status change"
                  className="tap-target mt-3 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" 
                  placeholder="Reason" 
                />
                
                <button className="tap-target mt-3 w-full rounded-lg bg-ironman-navy px-4 py-2 font-semibold text-white" type="submit">
                  Update
                </button>
              </form>
            </div>

            {message ? (
              <p className="rounded-lg bg-ironman-navy-50 px-3 py-2 text-sm font-semibold text-ironman-navy animate-in fade-in slide-in-from-top-1">
                {message}
              </p>
            ) : null}
            
            <PaymentLedger payments={payments} />
          </section>
          
          <section className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
            <TrackingTimeline events={tracking} />
          </section>
        </div>
      ) : (
        <p className="rounded-lg bg-white p-5 text-sm font-semibold text-ironman-navy shadow-soft">Loading order...</p>
      )}
    </RequireAuth>
  )
}
