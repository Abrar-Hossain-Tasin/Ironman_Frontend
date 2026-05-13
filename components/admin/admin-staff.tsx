'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { RequireAuth } from '@/components/auth/require-auth'
import { StatusBadge } from '@/components/ui/status-badge'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import type { ReviewResponse, UserRole, UserSummary } from '@/types'

export function AdminStaff() {
  const token = useAuthStore((state) => state.accessToken)
  const [staff, setStaff] = useState<UserSummary[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [selected, setSelected] = useState<UserSummary | null>(null)
  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const [rating, setRating] = useState<number | null>(null)
  const [reviewLoading, setReviewLoading] = useState(false)

  async function load() {
    if (!token) return
    setStaff(await apiFetch<UserSummary[]>('/admin/staff', { token }))
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    if (!token || !selected) {
      setReviews([])
      setRating(null)
      return
    }
    let cancelled = false
    setReviewLoading(true)
    Promise.all([
      apiFetch<ReviewResponse[]>(`/admin/staff/${selected.id}/reviews`, { token }),
      apiFetch<number | null>(`/admin/staff/${selected.id}/rating`, { token }).catch(() => null)
    ])
      .then(([list, avg]) => {
        if (cancelled) return
        setReviews(list)
        setRating(avg)
      })
      .finally(() => {
        if (!cancelled) setReviewLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token, selected])

  async function createStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    const form = new FormData(event.currentTarget)
    await apiFetch<UserSummary>('/auth/admin/create-staff', {
      method: 'POST',
      token,
      body: {
        fullName: String(form.get('fullName') ?? ''),
        email: String(form.get('email') ?? ''),
        phone: String(form.get('phone') ?? ''),
        password: String(form.get('password') ?? ''),
        role: String(form.get('role') ?? 'delivery_man') as UserRole
      }
    })
    setMessage('Staff account created')
    event.currentTarget.reset()
    await load()
  }

  return (
    <RequireAuth roles={['admin']}>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {staff.map((person) => (
              <article key={person.id} className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-ironman-navy">{person.fullName}</h2>
                    <p className="mt-1 text-sm text-gray-600">{person.role.replaceAll('_', ' ')}</p>
                    <p className="mt-1 text-sm text-gray-600">{person.email}</p>
                  </div>
                  <StatusBadge status={person.active ? 'accepted' : 'rejected'} />
                </div>
                {person.role === 'delivery_man' ? (
                  <button
                    type="button"
                    onClick={() => setSelected((current) => (current?.id === person.id ? null : person))}
                    className="focus-ring mt-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-ironman-red hover:bg-ironman-red-50"
                  >
                    <Star className="h-3.5 w-3.5" aria-hidden />
                    {selected?.id === person.id ? 'Hide reviews' : 'View reviews'}
                  </button>
                ) : null}
              </article>
            ))}
          </div>

          {selected ? (
            <section className="rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft">
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-ironman-navy">Reviews — {selected.fullName}</h3>
                  <p className="text-xs text-gray-500">{reviews.length} review{reviews.length === 1 ? '' : 's'}</p>
                </div>
                {rating != null ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
                    <Star className="h-4 w-4" aria-hidden />
                    {rating.toFixed(2)} / 5
                  </span>
                ) : null}
              </header>

              {reviewLoading ? (
                <p className="mt-3 text-sm text-gray-500">Loading reviews…</p>
              ) : reviews.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">No reviews yet.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {reviews.map((review) => (
                    <li key={review.id} className="rounded-lg border border-ironman-navy-100 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-ironman-navy">{review.customerName}</p>
                        <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                          <Star className="h-4 w-4" aria-hidden />
                          {review.overallRating} / 5
                        </span>
                        {review.serviceRating ? <span>Service {review.serviceRating}/5</span> : null}
                        {review.deliveryRating ? <span>Delivery {review.deliveryRating}/5</span> : null}
                      </div>
                      {review.comment ? <p className="mt-2 text-sm text-gray-700">{review.comment}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </div>

        <form className="h-fit rounded-lg border border-ironman-navy-100 bg-white p-5 shadow-soft" onSubmit={createStaff}>
          <h2 className="text-xl font-bold text-ironman-navy">Create staff</h2>
          <div className="mt-4 space-y-3">
            <input name="fullName" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Full name" required />
            <input name="email" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Email" type="email" required />
            <input name="phone" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Phone" required />
            <input name="password" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" placeholder="Password" type="password" minLength={8} required />
            <select name="role" className="tap-target w-full rounded-lg border border-ironman-navy-100 bg-ironman-navy-50 px-3 py-2 focus-ring" defaultValue="delivery_man">
              <option value="delivery_man">Delivery man</option>
              <option value="wash_man">Wash man</option>
              <option value="iron_man">Iron man</option>
              <option value="dry_clean_man">Dry clean man</option>
            </select>
          </div>
          {message ? <p className="mt-3 rounded-lg bg-ironman-navy-50 px-3 py-2 text-sm font-semibold text-ironman-navy">{message}</p> : null}
          <button className="tap-target mt-4 w-full rounded-lg bg-ironman-red px-4 py-2 font-semibold text-white" type="submit">Create</button>
        </form>
      </div>
    </RequireAuth>
  )
}
