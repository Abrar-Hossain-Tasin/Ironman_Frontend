'use client'

import { useEffect, useMemo, useState } from 'react'
import { RequireAuth } from '@/components/auth/require-auth'
import { MetricCard } from '@/components/ui/metric-card'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { formatBdt } from '@/lib/utils'
import type { OrderResponse, OrderStatus, PaymentLedgerRow, RefundResponse } from '@/types'

type WindowKey = '7' | '30' | '90' | 'all'

const WINDOW_LABEL: Record<WindowKey, string> = {
  '7': 'Last 7 days',
  '30': 'Last 30 days',
  '90': 'Last 90 days',
  all: 'All time'
}

const COMPLETED_STATUSES = new Set<OrderStatus>(['delivered'])
const FAILED_STATUSES = new Set<OrderStatus>(['delivery_failed', 'returned', 'cancelled'])

function withinWindow(iso: string, windowKey: WindowKey): boolean {
  if (windowKey === 'all') return true
  const days = Number(windowKey)
  const ms = Date.now() - days * 24 * 60 * 60 * 1000
  return new Date(iso).getTime() >= ms
}

export function AdminReports() {
  const token = useAuthStore((state) => state.accessToken)
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [payments, setPayments] = useState<PaymentLedgerRow[]>([])
  const [refunds, setRefunds] = useState<RefundResponse[]>([])
  const [windowKey, setWindowKey] = useState<WindowKey>('30')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    Promise.all([
      apiFetch<OrderResponse[]>('/admin/orders', { token }),
      apiFetch<PaymentLedgerRow[]>('/payments', { token }),
      apiFetch<RefundResponse[]>('/admin/refunds', { token }).catch(() => [] as RefundResponse[])
    ])
      .then(([nextOrders, nextPayments, nextRefunds]) => {
        setOrders(nextOrders)
        setPayments(nextPayments)
        setRefunds(nextRefunds)
      })
      .finally(() => setLoading(false))
  }, [token])

  const filteredOrders = useMemo(
    () => orders.filter((order) => withinWindow(order.createdAt, windowKey)),
    [orders, windowKey]
  )
  const filteredPayments = useMemo(
    () => payments.filter((row) => withinWindow(row.collectedAt, windowKey)),
    [payments, windowKey]
  )
  const filteredRefunds = useMemo(
    () => refunds.filter((row) => withinWindow(row.requestedAt, windowKey)),
    [refunds, windowKey]
  )

  const orderCount = filteredOrders.length
  const grossRevenue = filteredPayments.reduce((sum, row) => sum + Number(row.amount), 0)
  const refundedAmount = filteredRefunds
    .filter((row) => row.status === 'processed')
    .reduce((sum, row) => sum + Number(row.amount), 0)
  const netRevenue = grossRevenue - refundedAmount
  const aov = orderCount === 0 ? 0 : filteredOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0) / orderCount

  const completed = filteredOrders.filter((order) => COMPLETED_STATUSES.has(order.status)).length
  const failed = filteredOrders.filter((order) => FAILED_STATUSES.has(order.status)).length
  const finalized = completed + failed
  const onTimePct = finalized === 0 ? null : (completed / finalized) * 100

  const topServices = useMemo(() => {
    const counts = new Map<string, number>()
    for (const order of filteredOrders) {
      for (const item of order.items) {
        counts.set(item.serviceCategoryName, (counts.get(item.serviceCategoryName) ?? 0) + item.quantity)
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [filteredOrders])

  const collectorLeaderboard = useMemo(() => {
    const totals = new Map<string, { name: string; total: number; count: number }>()
    for (const row of filteredPayments) {
      const key = row.collectedBy ?? 'unknown'
      const name = row.collectedByName ?? 'Unknown'
      const existing = totals.get(key) ?? { name, total: 0, count: 0 }
      existing.total += Number(row.amount)
      existing.count += 1
      totals.set(key, existing)
    }
    return [...totals.values()].sort((a, b) => b.total - a.total).slice(0, 5)
  }, [filteredPayments])

  return (
    <RequireAuth roles={['admin']}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border border-ironman-navy-100 bg-white p-1 text-sm shadow-soft">
        {(['7', '30', '90', 'all'] as WindowKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setWindowKey(key)}
            className={`rounded-md px-3 py-1.5 font-semibold transition ${
              windowKey === key ? 'bg-ironman-red text-white' : 'text-ironman-navy hover:bg-ironman-navy-50'
            }`}
          >
            {WINDOW_LABEL[key]}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-gray-500">Loading…</p> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Orders" value={String(orderCount)} icon="ListChecks" tone="red" />
        <MetricCard label="Gross revenue" value={formatBdt(grossRevenue)} icon="WalletCards" tone="navy" />
        <MetricCard label="Refunded" value={formatBdt(refundedAmount)} icon="WalletCards" />
        <MetricCard label="Net revenue" value={formatBdt(netRevenue)} icon="PackageCheck" tone="navy" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <MetricCard label="Average order value" value={formatBdt(Math.round(aov))} icon="WalletCards" />
        <MetricCard
          label="Delivery success rate"
          value={onTimePct == null ? '—' : `${onTimePct.toFixed(1)}%`}
          icon="Truck"
          tone={onTimePct != null && onTimePct >= 95 ? 'navy' : 'red'}
        />
        <MetricCard label="Refund tickets" value={String(filteredRefunds.length)} icon="AlertOctagon" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-bold text-ironman-navy">Top services</h3>
          {topServices.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No items yet.</p>
          ) : (
            <ol className="mt-3 space-y-2 text-sm">
              {topServices.map(([name, count], index) => (
                <li key={name} className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-ironman-navy">
                    {index + 1}. {name}
                  </span>
                  <span className="text-gray-600">{count} item{count === 1 ? '' : 's'}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-bold text-ironman-navy">Cash collectors</h3>
          {collectorLeaderboard.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No cash collections in window.</p>
          ) : (
            <ol className="mt-3 space-y-2 text-sm">
              {collectorLeaderboard.map((entry, index) => (
                <li key={entry.name + index} className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-ironman-navy">
                    {index + 1}. {entry.name}
                  </span>
                  <span className="text-gray-600">
                    {formatBdt(entry.total)} · {entry.count} tx
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </RequireAuth>
  )
}
