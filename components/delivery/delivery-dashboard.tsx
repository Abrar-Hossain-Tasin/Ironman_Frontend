// 'use client'

// import { useEffect, useState } from 'react'
// import { RequireAuth } from '@/components/auth/require-auth'
// import { AssignmentCard } from '@/components/tasks/assignment-card'
// import { apiFetch } from '@/lib/api'
// import { useAuthStore } from '@/lib/auth-store'
// import type { Assignment } from '@/types'

// export function DeliveryDashboard() {
//   const token = useAuthStore((state) => state.accessToken)
//   const [assignments, setAssignments] = useState<Assignment[]>([])
//   const [message, setMessage] = useState<string | null>(null)

//   async function load() {
//     if (!token) return
//     setAssignments(await apiFetch<Assignment[]>('/delivery/assignments', { token }))
//   }

//   useEffect(() => {
//     void load()
//   }, [token])

//   async function action(assignment: Assignment, path: string) {
//     if (!token) return
//     await apiFetch(`/delivery/assignments/${assignment.id}/${path}`, {
//       method: 'PUT',
//       token,
//       body: path === 'complete' ? { notes: 'Completed from delivery dashboard' } : undefined
//     })
//     setMessage(`${assignment.orderNumber} ${path}`)
//     await load()
//   }

//   return (
//     <RequireAuth roles={['delivery_man']}>
//       {message ? <p className="mb-4 rounded-lg bg-ironman-navy-50 px-3 py-2 text-sm font-semibold text-ironman-navy">{message}</p> : null}
//       <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//         {assignments.map((assignment) => (
//           <AssignmentCard
//             key={assignment.id}
//             assignment={assignment}
//             onAccept={(item) => action(item, 'accept')}
//             onStart={(item) => action(item, 'start')}
//             onComplete={(item) => action(item, 'complete')}
//           />
//         ))}
//       </div>
//     </RequireAuth>
//   )
// }

'use client'

import { useEffect, useState } from 'react'
import { RequireAuth } from '@/components/auth/require-auth'
import { AssignmentCard } from '@/components/tasks/assignment-card'
import { apiFetch } from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'
import type { Assignment } from '@/types'

export function DeliveryDashboard() {
  const token = useAuthStore((state) => state.accessToken)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)

  async function load() {
    if (!token) return
    const data = await apiFetch<Assignment[]>('/delivery/assignments', { token })
    setAssignments(data)
  }

  useEffect(() => {
    void load()
  }, [token])

  // --- Location Tracking Logic Start ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Check if there's an active task
    const activeTask = assignments.find(
      (a) => a.status === 'accepted' || a.status === 'in_progress'
    );

    if (activeTask && token) {
      setIsTracking(true);
      interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              await apiFetch('/delivery/location', {
                method: 'POST',
                token,
                body: {
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  accuracy: pos.coords.accuracy,
                  orderId: activeTask.orderId // or activeTask.id based on your API
                }
              });
            } catch (err) {
              console.error("GPS Push failed", err);
            }
          },
          (err) => console.error("Geolocation error:", err),
          { enableHighAccuracy: true }
        );
      }, 10000); // Push every 10 seconds
    } else {
      setIsTracking(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [assignments, token]);
  // --- Location Tracking Logic End ---

  async function action(assignment: Assignment, path: string) {
    if (!token) return
    await apiFetch(`/delivery/assignments/${assignment.id}/${path}`, {
      method: 'PUT',
      token,
      body: path === 'complete' ? { notes: 'Completed from delivery dashboard' } : undefined
    })
    setMessage(`${assignment.orderNumber} ${path}`)
    await load()
  }

  return (
    <RequireAuth roles={['delivery_man']}>
      {/* Optional: Tracking Indicator */}
      {isTracking && (
        <div className="mb-4 flex items-center gap-2 text-xs text-green-600 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live GPS tracking active
        </div>
      )}

      {message ? (
        <p className="mb-4 rounded-lg bg-ironman-navy-50 px-3 py-2 text-sm font-semibold text-ironman-navy">
          {message}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            onAccept={(item) => action(item, 'accept')}
            onStart={(item) => action(item, 'start')}
            onComplete={(item) => action(item, 'complete')}
          />
        ))}
      </div>
    </RequireAuth>
  )
}
