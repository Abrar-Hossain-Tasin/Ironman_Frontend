'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { RequireAuth } from '@/components/auth/require-auth'
import { MetricCard } from '@/components/ui/metric-card'
import { OrderTable } from '@/components/orders/order-table'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { orderToSummary } from '@/lib/mappers'
import { formatBdt } from '@/lib/utils'
import type { OrderResponse } from '@/types'

export function CustomerDashboard() {
  const token = useAuthStore((state) => state.accessToken)
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    apiFetch<OrderResponse[]>('/orders', { token })
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load orders'))
  }, [token])

  const summaries = useMemo(() => orders.map(orderToSummary), [orders])
  const active = orders.filter((order) => !['delivered', 'cancelled'].includes(order.status)).length
  const due = orders.reduce((sum, order) => sum + Math.max(0, Number(order.totalAmount) - Number(order.paidAmount)), 0)
  const delivered = orders.filter((order) => order.status === 'delivered').length

  return (
    <RequireAuth roles={['customer']}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Active orders" value={String(active)} icon="PackageCheck" tone="red" />
        <MetricCard label="Awaiting payment" value={formatBdt(due)} icon="WalletCards" />
        <MetricCard label="Delivered" value={String(delivered)} icon="Check" tone="navy" />
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-ironman-navy">Recent orders</h2>
        <Link href="/customer/orders/new" className="tap-target focus-ring inline-flex items-center justify-center rounded-lg bg-ironman-red px-4 py-2 font-semibold text-white">
          Place New Order
        </Link>
      </div>
      {error ? <p className="mt-4 rounded-lg bg-ironman-red-50 px-3 py-2 text-sm font-semibold text-ironman-red">{error}</p> : null}
      <div className="mt-4">
        <OrderTable orders={summaries} />
      </div>
    </RequireAuth>
  )
}
