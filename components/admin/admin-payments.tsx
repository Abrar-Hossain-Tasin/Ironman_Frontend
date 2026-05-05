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

  useEffect(() => {
    if (!token) return
    apiFetch<PaymentLedgerRow[]>('/payments', { token }).then(setPayments)
  }, [token])

  return (
    <RequireAuth roles={['admin']}>
      <PaymentLedger payments={payments} />
    </RequireAuth>
  )
}
