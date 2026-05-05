'use client'

import { useEffect, useState } from 'react'
import { RequireAuth } from '@/components/auth/require-auth'
import { AssignmentCard } from '@/components/tasks/assignment-card'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import type { Assignment } from '@/types'

export function WorkerDashboard() {
  const token = useAuthStore((state) => state.accessToken)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    if (!token) return
    setAssignments(await apiFetch<Assignment[]>('/worker/assignments', { token }))
  }

  useEffect(() => {
    void load()
  }, [token])

  async function action(assignment: Assignment, path: string) {
    if (!token) return
    await apiFetch(`/worker/assignments/${assignment.id}/${path}`, {
      method: 'PUT',
      token,
      body: path === 'complete' ? { notes: 'Completed from worker dashboard' } : undefined
    })
    setMessage(`${assignment.orderNumber} ${path}`)
    await load()
  }

  return (
    <RequireAuth roles={['wash_man', 'iron_man', 'dry_clean_man']}>
      {message ? <p className="mb-4 rounded-lg bg-ironman-navy-50 px-3 py-2 text-sm font-semibold text-ironman-navy">{message}</p> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            onStart={(item) => action(item, 'start')}
            onComplete={(item) => action(item, 'complete')}
          />
        ))}
      </div>
    </RequireAuth>
  )
}
