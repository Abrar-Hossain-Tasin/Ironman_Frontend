'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Camera, MapPin, WalletCards } from 'lucide-react'
import { RequireAuth } from '@/components/auth/require-auth'
import { AssignmentCard } from '@/components/tasks/assignment-card'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import type { Assignment } from '@/types'

type DeliveryAssignmentDetailProps = {
  id: string
}

export function DeliveryAssignmentDetail({ id }: DeliveryAssignmentDetailProps) {
  const token = useAuthStore((state) => state.accessToken)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    if (!token) return
    const assignments = await apiFetch<Assignment[]>('/delivery/assignments', { token })
    setAssignment(assignments.find((item) => item.id === id) ?? null)
  }

  useEffect(() => {
    void load()
  }, [id, token])

  async function recordCash(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token || !assignment) return
    const form = new FormData(event.currentTarget)
    await apiFetch('/delivery/payments', {
      method: 'POST',
      token,
      body: {
        orderId: assignment.orderId,
        amount: Number(form.get('amount') ?? 0),
        paymentType: assignment.assignmentType === 'pickup' ? 'cod_pickup' : 'cod_delivery',
        notes: String(form.get('notes') ?? '')
      }
    })
    setMessage('Cash recorded')
    event.currentTarget.reset()
  }

  return (
    <RequireAuth roles={['delivery_man']}>
      {assignment ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <AssignmentCard assignment={assignment} />
          <section className="space-y-4">
            {message ? <p className="rounded-lg bg-ironman-navy-50 px-3 py-2 text-sm font-semibold text-ironman-navy">{message}</p> : null}
            <a href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(assignment.address ?? '')}`} target="_blank" rel="noreferrer" className="tap-target focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-ironman-navy px-4 py-3 font-semibold text-white">
              <MapPin className="h-5 w-5" aria-hidden />
              Open Map
            </a>
            <button className="tap-target focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-ironman-red px-4 py-3 font-semibold text-white" type="button">
              <Camera className="h-5 w-5" aria-hidden />
              Upload Proof
            </button>
            <form className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft" onSubmit={recordCash}>
              <h2 className="flex items-center gap-2 text-lg font-bold text-ironman-navy">
                <WalletCards className="h-5 w-5 text-ironman-red" aria-hidden />
                Cash collection
              </h2>
              <input name="amount" className="tap-target mt-4 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Amount received" type="number" min="1" required />
              <input name="notes" className="tap-target mt-3 w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Notes" />
              <button className="tap-target focus-ring mt-3 w-full rounded-lg bg-ironman-red px-4 py-3 font-semibold text-white" type="submit">
                Record Cash
              </button>
            </form>
          </section>
        </div>
      ) : (
        <p className="rounded-lg bg-white p-5 text-sm font-semibold text-ironman-navy shadow-soft">Loading assignment...</p>
      )}
    </RequireAuth>
  )
}
