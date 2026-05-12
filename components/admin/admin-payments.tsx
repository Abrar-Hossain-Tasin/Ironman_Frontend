'use client'

import { useEffect, useState } from 'react'
import { RequireAuth } from '@/components/auth/require-auth'
import { PaymentLedger } from '@/components/payments/payment-ledger'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import type { PaymentLedgerRow } from '@/types'

export function AdminPayments() {
  const token = useAuthStore((state) => state.accessToken)
  const [payments, setPayments] = useState<PaymentLedgerRow[]>([])

  async function load() {
    if (!token) return
    setPayments(await apiFetch<PaymentLedgerRow[]>('/payments', { token }))
  }

  useEffect(() => {
    void load()
  }, [token])

  async function verify(payment: PaymentLedgerRow) {
    if (!token) return
    await apiFetch<PaymentLedgerRow>(`/payments/${payment.id}/verify`, {
      method: 'PUT',
      token
    })
    await load()
  }

  return (
    <RequireAuth roles={['admin']}>
      <PaymentLedger payments={payments} onVerify={verify} />
    </RequireAuth>
  )
}
