'use client'

import { useEffect, useState } from 'react'
import { RequireAuth } from '@/components/auth/require-auth'
import { PaymentLedger } from '@/components/payments/payment-ledger'
import { TrackingTimeline } from '@/components/ui/tracking-timeline'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { formatBdt } from '@/lib/utils'
import type { OrderResponse, PaymentLedgerRow, TrackingEvent } from '@/types'

type CustomerOrderDetailProps = {
  id: string
}

export function CustomerOrderDetail({ id }: CustomerOrderDetailProps) {
  const token = useAuthStore((state) => state.accessToken)
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [tracking, setTracking] = useState<TrackingEvent[]>([])
  const [payments, setPayments] = useState<PaymentLedgerRow[]>([])
  const [error, setError] = useState<string | null>(null)

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
