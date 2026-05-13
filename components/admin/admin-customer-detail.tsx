'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AlertOctagon, ArrowLeft, ListChecks, PackageCheck, WalletCards } from 'lucide-react'
import { RequireAuth } from '@/components/auth/require-auth'
import { MetricCard } from '@/components/ui/metric-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { formatBdt, statusLabel } from '@/lib/utils'
import type { IssueResponse, OrderResponse, PaymentLedgerRow, RefundResponse } from '@/types'

type Props = {
  customerId: string
}

export function AdminCustomerDetail({ customerId }: Props) {
  const token = useAuthStore((state) => state.accessToken)
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [payments, setPayments] = useState<PaymentLedgerRow[]>([])
  const [refunds, setRefunds] = useState<RefundResponse[]>([])
  const [issues, setIssues] = useState<IssueResponse[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      apiFetch<OrderResponse[]>('/admin/orders', { token }),
      apiFetch<PaymentLedgerRow[]>('/payments', { token }),
      apiFetch<RefundResponse[]>('/admin/refunds', { token })
    ])
      .then(async ([allOrders, allPayments, allRefunds]) => {
        if (cancelled) return
        const myOrders = allOrders.filter((order) => order.customer.id === customerId)
        const orderIds = new Set(myOrders.map((order) => order.id))
        setOrders(myOrders)
        setPayments(allPayments.filter((row) => row.orderId && orderIds.has(row.orderId)))
        setRefunds(allRefunds.filter((row) => orderIds.has(row.orderId)))

        // Issues are per-order; fetch in parallel.
        const issueLists = await Promise.all(
          myOrders.map((order) =>
            apiFetch<IssueResponse[]>(`/orders/${order.id}/issues`, { token }).catch(() => [])
          )
        )
        if (!cancelled) {
          setIssues(issueLists.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token, customerId])

  const profile = orders[0]?.customer
  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
    [orders]
  )
  const totalPaid = useMemo(
    () => payments.reduce((sum, row) => sum + Number(row.amount), 0),
    [payments]
  )
  const openIssues = issues.filter((issue) => issue.status === 'open' || issue.status === 'in_review').length

  return (
    <RequireAuth roles={['admin']}>
      <div className="mb-4">
        <Link
          href="/admin/customers"
          className="focus-ring inline-flex items-center gap-1 text-sm font-semibold text-ironman-red hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All customers
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading customer 360…</p>
      ) : !profile ? (
        <p className="rounded-lg bg-white p-5 text-sm text-gray-600 shadow-soft">No orders on file for this customer.</p>
      ) : (
        <div className="space-y-6">
          <header className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-bold text-ironman-navy">{profile.fullName}</h2>
            <p className="mt-1 text-sm text-gray-600">{profile.email} · {profile.phone}</p>
            {profile.emailVerified === false ? (
              <p className="mt-1 text-xs font-semibold text-amber-700">Email not verified</p>
            ) : null}
          </header>

          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Orders" value={String(orders.length)} icon="ListChecks" tone="red" />
            <MetricCard label="Total spent" value={formatBdt(totalSpent)} icon="WalletCards" tone="navy" />
            <MetricCard label="Total paid" value={formatBdt(totalPaid)} icon="PackageCheck" />
            <MetricCard
              label="Open issues"
              value={String(openIssues)}
              icon="AlertOctagon"
              tone={openIssues > 0 ? 'red' : 'navy'}
            />
          </div>

          <section className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
            <h3 className="flex items-center gap-2 text-lg font-bold text-ironman-navy">
              <ListChecks className="h-5 w-5 text-ironman-red" aria-hidden />
              Orders
            </h3>
            {orders.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">No orders.</p>
            ) : (
              <ul className="mt-3 divide-y divide-ironman-navy-100">
                {orders.map((order) => (
                  <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <Link href={`/admin/orders/${order.id}`} className="font-semibold text-ironman-red hover:underline">
                        {order.orderNumber}
                      </Link>
                      <p className="text-xs text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <span className="font-semibold text-ironman-navy">{formatBdt(order.totalAmount)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
            <h3 className="flex items-center gap-2 text-lg font-bold text-ironman-navy">
              <WalletCards className="h-5 w-5 text-ironman-red" aria-hidden />
              Payments &amp; refunds
            </h3>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Payments</p>
                {payments.length === 0 ? (
                  <p className="mt-1 text-sm text-gray-500">No payments recorded.</p>
                ) : (
                  <ul className="mt-1 space-y-1 text-sm">
                    {payments.map((row) => (
                      <li key={row.id} className="flex items-center justify-between">
                        <span>
                          {statusLabel(row.paymentType)} · {new Date(row.collectedAt).toLocaleDateString()}
                        </span>
                        <span className="font-semibold">{formatBdt(row.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Refunds</p>
                {refunds.length === 0 ? (
                  <p className="mt-1 text-sm text-gray-500">No refunds.</p>
                ) : (
                  <ul className="mt-1 space-y-1 text-sm">
                    {refunds.map((row) => (
                      <li key={row.id} className="flex items-center justify-between">
                        <span>{statusLabel(row.status)} · {new Date(row.requestedAt).toLocaleDateString()}</span>
                        <span className="font-semibold">{formatBdt(row.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
            <h3 className="flex items-center gap-2 text-lg font-bold text-ironman-navy">
              <AlertOctagon className="h-5 w-5 text-ironman-red" aria-hidden />
              Issues
            </h3>
            {issues.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">No complaints recorded.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {issues.map((issue) => (
                  <li key={issue.id} className="rounded-lg border border-ironman-navy-100 p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-ironman-navy">{statusLabel(issue.type)}</span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                          issue.status === 'open'
                            ? 'bg-ironman-red-50 text-ironman-red'
                            : issue.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {statusLabel(issue.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{new Date(issue.createdAt).toLocaleString()}</p>
                    <p className="mt-1 text-gray-700">{issue.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </RequireAuth>
  )
}
