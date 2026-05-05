'use client'

import { useEffect, useMemo, useState } from 'react'
import { RequireAuth } from '@/components/auth/require-auth'
import { OrderTable } from '@/components/orders/order-table'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { orderToSummary } from '@/lib/mappers'
import type { OrderResponse, OrderStatus } from '@/types'

export function CustomerOrders() {
  const token = useAuthStore((state) => state.accessToken)
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    apiFetch<OrderResponse[]>('/orders', { token })
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load orders'))
  }, [token])

  const summaries = useMemo(() => {
    return orders
      .filter((order) => !status || order.status === status)
      .map(orderToSummary)
  }, [orders, status])

  return (
    <RequireAuth roles={['customer']}>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <select className="tap-target rounded-lg border border-ironman-navy-100 bg-white px-3 py-2 focus-ring" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {(['pending', 'in_wash', 'ready', 'delivered'] satisfies OrderStatus[]).map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <input className="tap-target rounded-lg border border-ironman-navy-100 bg-white px-3 py-2 focus-ring" type="date" />
        <input className="tap-target rounded-lg border border-ironman-navy-100 bg-white px-3 py-2 focus-ring" type="date" />
      </div>
      {error ? <p className="mb-4 rounded-lg bg-ironman-red-50 px-3 py-2 text-sm font-semibold text-ironman-red">{error}</p> : null}
      <OrderTable orders={summaries} />
    </RequireAuth>
  )
}
