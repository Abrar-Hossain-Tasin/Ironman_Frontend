import { AdminOrderDetail } from '@/components/admin/admin-order-detail'
import { PortalShell } from '@/components/layout/portal-shell'

const nav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/admin/orders', label: 'Orders', icon: 'ListChecks' },
  { href: '/admin/assignments', label: 'Assignments', icon: 'Truck' },
  { href: '/admin/pricing', label: 'Pricing', icon: 'WalletCards' },
  { href: '/admin/staff', label: 'Staff', icon: 'UserRound' }
]

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <PortalShell title="Admin Order Detail" subtitle="Management panel" nav={nav}>
      <AdminOrderDetail id={params.id} />
    </PortalShell>
  )
}
