'use client'

import { useEffect, useMemo, useState } from 'react'
import { RequireAuth } from '@/components/auth/require-auth'
import { OrderTable } from '@/components/orders/order-table'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { orderToSummary } from '@/lib/mappers'
import type { OrderResponse } from '@/types'

export function AdminOrders() {
  const token = useAuthStore((state) => state.accessToken)
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!token) return
    apiFetch<OrderResponse[]>(status ? `/admin/orders?status=${status}` : '/admin/orders', { token }).then(setOrders)
  }, [status, token])

  const rows = useMemo(() => {
    return orders
      .filter((order) => {
        const query = search.toLowerCase()
        return !query || order.orderNumber.toLowerCase().includes(query) || order.customer.fullName.toLowerCase().includes(query)
      })
      .map(orderToSummary)
  }, [orders, search])

  return (
    <RequireAuth roles={['admin']}>
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <input className="tap-target rounded-lg border border-ironman-navy-100 bg-white px-3 py-2 focus-ring" placeholder="Search customer or order" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="tap-target rounded-lg border border-ironman-navy-100 bg-white px-3 py-2 focus-ring" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">pending</option>
          <option value="confirmed">confirmed</option>
          <option value="ready">ready</option>
          <option value="out_for_delivery">out_for_delivery</option>
        </select>
        <input className="tap-target rounded-lg border border-ironman-navy-100 bg-white px-3 py-2 focus-ring" type="date" />
        <a href="/admin/assignments" className="tap-target inline-flex items-center justify-center rounded-lg bg-ironman-red px-4 py-2 font-semibold text-white">Assignment Board</a>
      </div>
      <OrderTable orders={rows} baseHref="/admin/orders" />
    </RequireAuth>
  )
}
