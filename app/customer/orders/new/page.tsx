import { PortalShell } from '@/components/layout/portal-shell'
import { OrderWizard } from '@/components/orders/order-wizard'

const nav = [
  { href: '/customer/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/customer/orders/new', label: 'New Order', icon: 'PackageCheck' },
  { href: '/customer/orders', label: 'Orders', icon: 'ListChecks' },
  { href: '/customer/profile', label: 'Profile', icon: 'UserRound' }
]

export default function NewOrderPage() {
  return (
    <PortalShell title="Place New Order" subtitle="Customer portal" nav={nav}>
      <OrderWizard />
    </PortalShell>
  )
}
