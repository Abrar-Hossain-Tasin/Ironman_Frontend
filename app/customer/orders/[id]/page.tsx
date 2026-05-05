import { CustomerOrderDetail } from '@/components/customer/customer-order-detail'
import { PortalShell } from '@/components/layout/portal-shell'

const nav = [
  { href: '/customer/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/customer/orders/new', label: 'New Order', icon: 'PackageCheck' },
  { href: '/customer/orders', label: 'Orders', icon: 'ListChecks' },
  { href: '/customer/profile', label: 'Profile', icon: 'UserRound' }
]

export default function CustomerOrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <PortalShell title="Order Detail" subtitle="Order detail" nav={nav}>
      <CustomerOrderDetail id={params.id} />
    </PortalShell>
  )
}
