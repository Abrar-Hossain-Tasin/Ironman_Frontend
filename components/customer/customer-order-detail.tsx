// 'use client'

// import { useEffect, useState } from 'react'
// import { RequireAuth } from '@/components/auth/require-auth'
// import { PaymentLedger } from '@/components/payments/payment-ledger'
// import { TrackingTimeline } from '@/components/ui/tracking-timeline'
// import { apiFetch } from '@/lib/api'
// import { useAuthStore } from '@/lib/auth-store'
// import { formatBdt } from '@/lib/utils'
// import type { OrderResponse, PaymentLedgerRow, TrackingEvent } from '@/types'

// type CustomerOrderDetailProps = {
//   id: string
// }

// export function CustomerOrderDetail({ id }: CustomerOrderDetailProps) {
//   const token = useAuthStore((state) => state.accessToken)
//   const [order, setOrder] = useState<OrderResponse | null>(null)
//   const [tracking, setTracking] = useState<TrackingEvent[]>([])
//   const [payments, setPayments] = useState<PaymentLedgerRow[]>([])
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     if (!token) return
//     Promise.all([
//       apiFetch<OrderResponse>(`/orders/${id}`, { token }),
//       apiFetch<TrackingEvent[]>(`/orders/${id}/tracking`, { token }),
//       apiFetch<PaymentLedgerRow[]>(`/orders/${id}/payments`, { token })
//     ])
//       .then(([nextOrder, nextTracking, nextPayments]) => {
//         setOrder(nextOrder)
//         setTracking(nextTracking)
//         setPayments(nextPayments)
//       })
//       .catch((err) => setError(err instanceof Error ? err.message : 'Could not load order'))
//   }, [id, token])

//   return (
//     <RequireAuth roles={['customer']}>
//       {error ? <p className="mb-4 rounded-lg bg-ironman-red-50 px-3 py-2 text-sm font-semibold text-ironman-red">{error}</p> : null}
//       {order ? (
//         <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
//           <section className="space-y-6">
//             <div className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
//               <h2 className="text-xl font-bold text-ironman-navy">Summary</h2>
//               <dl className="mt-4 grid gap-4 md:grid-cols-3">
//                 <div><dt className="text-xs uppercase tracking-wide text-gray-500">Items</dt><dd className="mt-1 font-bold text-ironman-navy">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</dd></div>
//                 <div><dt className="text-xs uppercase tracking-wide text-gray-500">Total</dt><dd className="mt-1 font-bold text-ironman-navy">{formatBdt(Number(order.totalAmount))}</dd></div>
//                 <div><dt className="text-xs uppercase tracking-wide text-gray-500">Paid</dt><dd className="mt-1 font-bold text-ironman-navy">{formatBdt(Number(order.paidAmount))}</dd></div>
//               </dl>
//             </div>
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

// import { useEffect, useState } from 'react'
// import { RequireAuth } from '@/components/auth/require-auth'
// import { PaymentLedger } from '@/components/payments/payment-ledger'
// import { TrackingTimeline } from '@/components/ui/tracking-timeline'
// import { apiFetch } from '@/lib/api'
// import { useAuthStore } from '@/lib/auth-store'
// import { formatBdt } from '@/lib/utils'
// import type { OrderResponse, PaymentLedgerRow, TrackingEvent } from '@/types'

// // 1. Add Leaflet imports
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
// import 'leaflet/dist/leaflet.css'
// import L from 'leaflet'

// // Fix for default Leaflet icon marker issues in Next.js
// const markerIcon = new L.Icon({
//   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// })

// type CustomerOrderDetailProps = {
//   id: string
// }

// export function CustomerOrderDetail({ id }: CustomerOrderDetailProps) {
//   const token = useAuthStore((state) => state.accessToken)
//   const [order, setOrder] = useState<OrderResponse | null>(null)
//   const [tracking, setTracking] = useState<TrackingEvent[]>([])
//   const [payments, setPayments] = useState<PaymentLedgerRow[]>([])
//   const [error, setError] = useState<string | null>(null)
  
//   // 2. State for live location
//   const [agentLocation, setAgentLocation] = useState<{lat: number, lng: number} | null>(null)
//   const [mounted, setMounted] = useState(false)

//   // Handle mounting state to avoid SSR issues with Leaflet
//   useEffect(() => {
//     setMounted(true)
//   }, [])

//   useEffect(() => {
//     if (!token) return
//     Promise.all([
//       apiFetch<OrderResponse>(`/orders/${id}`, { token }),
//       apiFetch<TrackingEvent[]>(`/orders/${id}/tracking`, { token }),
//       apiFetch<PaymentLedgerRow[]>(`/orders/${id}/payments`, { token })
//     ])
//       .then(([nextOrder, nextTracking, nextPayments]) => {
//         setOrder(nextOrder)
//         setTracking(nextTracking)
//         setPayments(nextPayments)
//       })
//       .catch((err) => setError(err instanceof Error ? err.message : 'Could not load order'))
//   }, [id, token])

//   // 3. Add Polling to get location
//   useEffect(() => {
//     if (order && (order.status === 'out_for_delivery' || order.status === 'pickup_assigned')) {
//       const poll = setInterval(async () => {
//         try {
//           const data: any = await apiFetch(`/location/orders/${order.id}`, { token });
//           if (data?.latitude && data?.longitude) {
//             setAgentLocation({ lat: data.latitude, lng: data.longitude });
//           }
//         } catch (e) { 
//           /* Agent hasn't moved yet or endpoint pending */ 
//         }
//       }, 5000);
//       return () => clearInterval(poll);
//     }
//   }, [order, token]);

//   return (
//     <RequireAuth roles={['customer']}>
//       {error ? <p className="mb-4 rounded-lg bg-ironman-red-50 px-3 py-2 text-sm font-semibold text-ironman-red">{error}</p> : null}
//       {order ? (
//         <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
//           <section className="space-y-6">
//             <div className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
//               <h2 className="text-xl font-bold text-ironman-navy">Summary</h2>
//               <dl className="mt-4 grid gap-4 md:grid-cols-3">
//                 <div><dt className="text-xs uppercase tracking-wide text-gray-500">Items</dt><dd className="mt-1 font-bold text-ironman-navy">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</dd></div>
//                 <div><dt className="text-xs uppercase tracking-wide text-gray-500">Total</dt><dd className="mt-1 font-bold text-ironman-navy">{formatBdt(Number(order.totalAmount))}</dd></div>
//                 <div><dt className="text-xs uppercase tracking-wide text-gray-500">Paid</dt><dd className="mt-1 font-bold text-ironman-navy">{formatBdt(Number(order.paidAmount))}</dd></div>
//               </dl>
//             </div>
//             <PaymentLedger payments={payments} />
//           </section>

//           <section className="space-y-6">
//             {/* 4. Map UI added above Tracking Timeline */}
//             {mounted && agentLocation && (
//               <div className="h-64 w-full overflow-hidden rounded-2xl border-2 border-ironman-red/20 shadow-luxury">
//                 <MapContainer 
//                   center={[agentLocation.lat, agentLocation.lng]} 
//                   zoom={15} 
//                   style={{ height: '100%', width: '100%' }}
//                 >
//                   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                   <Marker position={[agentLocation.lat, agentLocation.lng]} icon={markerIcon}>
//                     <Popup>Your Ironman agent is here</Popup>
//                   </Marker>
//                 </MapContainer>
//               </div>
//             )}

//             <div className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
//               <TrackingTimeline events={tracking} />
//             </div>
//           </section>
//         </div>
//       ) : (
//         <p className="rounded-lg bg-white p-5 text-sm font-semibold text-ironman-navy shadow-soft">Loading order...</p>
//       )}
//     </RequireAuth>
//   )
// }

'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic' // Import dynamic from next
import { RequireAuth } from '@/components/auth/require-auth'
import { PaymentLedger } from '@/components/payments/payment-ledger'
import { TrackingTimeline } from '@/components/ui/tracking-timeline'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { formatBdt } from '@/lib/utils'
import type { OrderResponse, PaymentLedgerRow, TrackingEvent } from '@/types'

// 1. Load the Map component safely (only in the browser)
const MapDisplay = dynamic(
  () => import('./MapDisplay'), 
  { 
    ssr: false, // This is the secret fix for "window is not defined"
    loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-2xl" /> 
  }
)

type CustomerOrderDetailProps = {
  id: string
}

export function CustomerOrderDetail({ id }: CustomerOrderDetailProps) {
  const token = useAuthStore((state) => state.accessToken)
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [tracking, setTracking] = useState<TrackingEvent[]>([])
  const [payments, setPayments] = useState<PaymentLedgerRow[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // 2. State for live location
  const [agentLocation, setAgentLocation] = useState<{lat: number, lng: number} | null>(null)

  useEffect(() => {
    if (!token) return
    Promise.all([
      apiFetch<OrderResponse>(`/orders/${id}`, { token }),
      apiFetch<TrackingEvent[]>(`/orders/${id}/tracking`, { token }),
      apiFetch<PaymentLedgerRow[]>(`/orders/${id}/payments`, { token })
    ])
      .then(([nextOrder, nextTracking, nextPayments]) => {
        setOrder(nextOrder)
        setTracking(nextTracking)
        setPayments(nextPayments)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load order'))
  }, [id, token])

  // 3. Polling Logic
  useEffect(() => {
    if (order && (order.status === 'out_for_delivery' || order.status === 'pickup_assigned')) {
      const poll = setInterval(async () => {
        try {
          const data: any = await apiFetch(`/location/orders/${order.id}`, { token });
          if (data?.latitude && data?.longitude) {
            setAgentLocation({ lat: data.latitude, lng: data.longitude });
          }
        } catch (e) { 
          /* Agent hasn't moved yet */ 
        }
      }, 5000);
      return () => clearInterval(poll);
    }
  }, [order, token]);

  return (
    <RequireAuth roles={['customer']}>
      {error ? <p className="mb-4 rounded-lg bg-ironman-red-50 px-3 py-2 text-sm font-semibold text-ironman-red">{error}</p> : null}
      {order ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="space-y-6">
            <div className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
              <h2 className="text-xl font-bold text-ironman-navy">Summary</h2>
              <dl className="mt-4 grid gap-4 md:grid-cols-3">
                <div><dt className="text-xs uppercase tracking-wide text-gray-500">Items</dt><dd className="mt-1 font-bold text-ironman-navy">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-gray-500">Total</dt><dd className="mt-1 font-bold text-ironman-navy">{formatBdt(Number(order.totalAmount))}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-gray-500">Paid</dt><dd className="mt-1 font-bold text-ironman-navy">{formatBdt(Number(order.paidAmount))}</dd></div>
              </dl>
            </div>
            <PaymentLedger payments={payments} />
          </section>

          <section className="space-y-6">
            {/* 4. Display Map component if we have a location */}
            {agentLocation && (
              <MapDisplay lat={agentLocation.lat} lng={agentLocation.lng} />
            )}

            <div className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
              <TrackingTimeline events={tracking} />
            </div>
          </section>
        </div>
      ) : (
        <p className="rounded-lg bg-white p-5 text-sm font-semibold text-ironman-navy shadow-soft">Loading order...</p>
      )}
    </RequireAuth>
  )
}