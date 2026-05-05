import { DeliveryAssignmentDetail } from '@/components/delivery/delivery-assignment-detail'
import { PortalShell } from '@/components/layout/portal-shell'

const nav = [
  { href: '/delivery/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/delivery/dashboard', label: 'Assignments', icon: 'Truck' }
]

export default function DeliveryAssignmentDetailPage({ params }: { params: { id: string } }) {
  return (
    <PortalShell title="Assignment Detail" subtitle="Delivery man app" nav={nav}>
      <DeliveryAssignmentDetail id={params.id} />
    </PortalShell>
  )
}
