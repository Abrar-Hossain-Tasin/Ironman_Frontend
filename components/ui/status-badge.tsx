import type { AssignmentStatus, OrderStatus, PaymentStatus } from '@/types'
import { cn, statusLabel } from '@/lib/utils'

type StatusBadgeProps = {
  status: OrderStatus | AssignmentStatus | PaymentStatus
  className?: string
}

const statusStyles: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-ironman-navy text-white',
  pickup_assigned: 'bg-blue-500 text-white',
  picked_up: 'bg-blue-700 text-white',
  in_wash: 'bg-cyan-600 text-white',
  wash_complete: 'bg-cyan-50 text-cyan-700',
  in_iron: 'bg-orange-500 text-white',
  iron_complete: 'bg-orange-50 text-orange-700',
  in_dry_clean: 'bg-purple-600 text-white',
  dry_clean_complete: 'bg-purple-50 text-purple-700',
  waiting_for_iron: 'bg-ironman-red-50 text-ironman-red',
  ready: 'bg-green-600 text-white',
  delivery_assigned: 'bg-ironman-navy-100 text-ironman-navy',
  out_for_delivery: 'bg-yellow-600 text-white',
  delivered: 'bg-green-700 text-white',
  cancelled: 'bg-red-600 text-white',
  accepted: 'bg-ironman-navy-100 text-ironman-navy',
  in_progress: 'bg-ironman-red text-white',
  completed: 'bg-green-700 text-white',
  rejected: 'bg-red-600 text-white',
  paid: 'bg-green-700 text-white',
  partial: 'bg-yellow-600 text-white'
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        statusStyles[status] ?? 'bg-gray-100 text-gray-700',
        className
      )}
    >
      {statusLabel(status as OrderStatus)}
    </span>
  )
}
