'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { RequireAuth } from '@/components/auth/require-auth'
import { MetricCard } from '@/components/ui/metric-card'
import { PaymentLedger } from '@/components/payments/payment-ledger'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import { formatBdt, statusLabel } from '@/lib/utils'
import type { PaymentLedgerRow, PaymentType } from '@/types'

const PAYMENT_TYPES: PaymentType[] = ['cod_pickup', 'cod_delivery', 'bkash_merchant', 'advance', 'partial']

type VerificationFilter = '' | 'verified' | 'unverified'

function inRange(iso: string, from: string, to: string) {
  if (!from && !to) return true
  const day = iso.slice(0, 10)
  if (from && day < from) return false
  if (to && day > to) return false
  return true
}

function csvEscape(value: string | number | null | undefined) {
  const s = value == null ? '' : String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function downloadCsv(rows: PaymentLedgerRow[]) {
  const header = [
    'collectedAt',
    'orderNumber',
    'amount',
    'paymentType',
    'collector',
    'payerPhone',
    'paymentReference',
    'verified',
    'verifiedAt'
  ].join(',')
  const body = rows
    .map((row) =>
      [
        row.collectedAt,
        row.orderNumber,
        row.amount,
        row.paymentType,
        row.collectedByName ?? '',
        row.payerPhone ?? '',
        row.paymentReference ?? '',
        row.verified ? 'yes' : 'no',
        row.verifiedAt ?? ''
      ]
        .map(csvEscape)
        .join(',')
    )
    .join('\n')
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ironman-payments-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function AdminPayments() {
  const token = useAuthStore((state) => state.accessToken)
  const [payments, setPayments] = useState<PaymentLedgerRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [paymentType, setPaymentType] = useState<PaymentType | ''>('')
  const [verification, setVerification] = useState<VerificationFilter>('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  async function load() {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      setPayments(await apiFetch<PaymentLedgerRow[]>('/payments', { token }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load payments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function verify(payment: PaymentLedgerRow) {
    if (!token) return
    try {
      await apiFetch<PaymentLedgerRow>(`/payments/${payment.id}/verify`, { method: 'PUT', token })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify payment')
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return payments.filter((row) => {
      if (!inRange(row.collectedAt, from, to)) return false
      if (paymentType && row.paymentType !== paymentType) return false
      if (verification === 'verified' && !row.verified) return false
      if (verification === 'unverified' && row.verified) return false
      if (!query) return true
      return (
        row.orderNumber.toLowerCase().includes(query) ||
        (row.collectedByName ?? '').toLowerCase().includes(query) ||
        (row.payerPhone ?? '').toLowerCase().includes(query) ||
        (row.paymentReference ?? '').toLowerCase().includes(query)
      )
    })
  }, [payments, search, paymentType, verification, from, to])

  const total = filtered.reduce((sum, row) => sum + Number(row.amount), 0)
  const verifiedTotal = filtered.filter((row) => row.verified).reduce((sum, row) => sum + Number(row.amount), 0)
  const pendingCount = filtered.filter((row) => !row.verified).length

  return (
    <RequireAuth roles={['admin']}>
      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <MetricCard label="Collected (filtered)" value={formatBdt(total)} icon="WalletCards" tone="navy" />
        <MetricCard label="Verified" value={formatBdt(verifiedTotal)} icon="Check" tone="red" />
        <MetricCard label="Awaiting verification" value={String(pendingCount)} icon="AlertOctagon" />
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-5">
        <label className="md:col-span-2 block">
          <span className="sr-only">Search</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
            <input
              className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-white pl-9 pr-3 py-2 focus-ring"
              placeholder="Order #, collector, payer phone, reference"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </label>
        <select
          className="tap-target rounded-lg border border-ironman-navy-100 bg-white px-3 py-2 focus-ring"
          value={paymentType}
          onChange={(event) => setPaymentType(event.target.value as PaymentType | '')}
        >
          <option value="">All methods</option>
          {PAYMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {statusLabel(type)}
            </option>
          ))}
        </select>
        <select
          className="tap-target rounded-lg border border-ironman-navy-100 bg-white px-3 py-2 focus-ring"
          value={verification}
          onChange={(event) => setVerification(event.target.value as VerificationFilter)}
        >
          <option value="">Any verification</option>
          <option value="verified">Verified only</option>
          <option value="unverified">Unverified only</option>
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => setFrom(event.target.value)}
            className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-white px-3 py-2 focus-ring"
            aria-label="From"
          />
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => setTo(event.target.value)}
            className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-white px-3 py-2 focus-ring"
            aria-label="To"
          />
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
        <p>
          {filtered.length} row{filtered.length === 1 ? '' : 's'} shown · {payments.length} total in ledger
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setPaymentType('')
              setVerification('')
              setFrom('')
              setTo('')
            }}
            className="tap-target rounded-lg border border-ironman-navy-100 bg-white px-3 py-1.5 font-semibold text-ironman-navy hover:bg-ironman-navy-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => downloadCsv(filtered)}
            disabled={filtered.length === 0}
            className="tap-target inline-flex items-center gap-1 rounded-lg bg-ironman-navy px-3 py-1.5 font-semibold text-white disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" aria-hidden /> Export CSV
          </button>
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg bg-ironman-red-50 px-3 py-2 text-sm font-semibold text-ironman-red">{error}</p>
      ) : null}

      {loading && payments.length === 0 ? (
        <p className="rounded-lg bg-white p-5 text-sm text-gray-500 shadow-soft">Loading payments…</p>
      ) : (
        <PaymentLedger payments={filtered} onVerify={verify} />
      )}
    </RequireAuth>
  )
}
