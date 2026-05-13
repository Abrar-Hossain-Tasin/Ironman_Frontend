'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { RequireAuth } from '@/components/auth/require-auth'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { formatBdt } from '@/lib/utils'
import type { OrderResponse } from '@/types'

type CustomerRow = {
  id: string
  fullName: string
  email: string
  phone: string
  orderCount: number
  totalSpent: number
  lastOrderAt: string
}

export function AdminCustomers() {
  const token = useAuthStore((state) => state.accessToken)
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!token) return
    setLoading(true)
    apiFetch<OrderResponse[]>('/admin/orders', { token })
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [token])

  const rows = useMemo<CustomerRow[]>(() => {
    const byCustomer = new Map<string, CustomerRow>()
    for (const order of orders) {
      const id = order.customer.id
      const existing = byCustomer.get(id)
      if (!existing) {
        byCustomer.set(id, {
          id,
          fullName: order.customer.fullName,
          email: order.customer.email,
          phone: order.customer.phone,
          orderCount: 1,
          totalSpent: Number(order.totalAmount),
          lastOrderAt: order.createdAt
        })
      } else {
        existing.orderCount += 1
        existing.totalSpent += Number(order.totalAmount)
        if (order.createdAt > existing.lastOrderAt) existing.lastOrderAt = order.createdAt
      }
    }
    const query = search.trim().toLowerCase()
    return [...byCustomer.values()]
      .filter((row) => {
        if (!query) return true
        return (
          row.fullName.toLowerCase().includes(query) ||
          row.email.toLowerCase().includes(query) ||
          row.phone.toLowerCase().includes(query)
        )
      })
      .sort((a, b) => b.lastOrderAt.localeCompare(a.lastOrderAt))
  }, [orders, search])

  return (
    <RequireAuth roles={['admin']}>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, email, or phone"
          className="tap-target rounded-lg border border-ironman-navy-100 bg-white px-3 py-2 focus-ring md:col-span-2"
        />
        <p className="self-center text-xs text-gray-500">
          {rows.length} customer{rows.length === 1 ? '' : 's'} · derived from order history
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-lg bg-white p-5 text-sm text-gray-600 shadow-soft">No customers yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-ironman-navy-100 bg-white shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-ironman-navy-50 text-left text-xs uppercase text-gray-600">
              <tr>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Contact</th>
                <th className="px-3 py-2 text-right">Orders</th>
                <th className="px-3 py-2 text-right">Total spent</th>
                <th className="px-3 py-2">Last order</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-ironman-navy-100">
                  <td className="px-3 py-2">
                    <Link href={`/admin/customers/${row.id}`} className="font-bold text-ironman-red hover:underline">
                      {row.fullName}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600">
                    {row.email}
                    <br />
                    {row.phone}
                  </td>
                  <td className="px-3 py-2 text-right">{row.orderCount}</td>
                  <td className="px-3 py-2 text-right font-semibold">{formatBdt(row.totalSpent)}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{new Date(row.lastOrderAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </RequireAuth>
  )
}
