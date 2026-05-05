'use client'

import { useEffect, useMemo, useState } from 'react'
import { RequireAuth } from '@/components/auth/require-auth'
import { MetricCard } from '@/components/ui/metric-card'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { formatBdt } from '@/lib/utils'
import type { OrderResponse, PaymentLedgerRow } from '@/types'

export function AdminReports() {
  const token = useAuthStore((state) => state.accessToken)
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [payments, setPayments] = useState<PaymentLedgerRow[]>([])

  useEffect(() => {
    if (!token) return
    Promise.all([
      apiFetch<OrderResponse[]>('/admin/orders', { token }),
      apiFetch<PaymentLedgerRow[]>('/payments', { token })
    ]).then(([nextOrders, nextPayments]) => {
      setOrders(nextOrders)
      setPayments(nextPayments)
    })
  }, [token])

  const topService = useMemo(() => {
    const counts = new Map<string, number>()
    orders.flatMap((order) => order.items).forEach((item) => {
      counts.set(item.serviceCategoryName, (counts.get(item.serviceCategoryName) ?? 0) + item.quantity)
    })
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No data'
  }, [orders])

  const revenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)

  return (
    <RequireAuth roles={['admin']}>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Orders" value={String(orders.length)} icon="ListChecks" tone="red" />
        <MetricCard label="Revenue logged" value={formatBdt(revenue)} icon="WalletCards" tone="navy" />
        <MetricCard label="Top service" value={topService} icon="PackageCheck" />
      </div>
    </RequireAuth>
  )
}
