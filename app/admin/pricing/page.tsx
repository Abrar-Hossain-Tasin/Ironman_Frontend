import { AdminPricing } from '@/components/admin/admin-pricing'
import { PortalShell } from '@/components/layout/portal-shell'

const nav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/admin/orders', label: 'Orders', icon: 'ListChecks' },
  { href: '/admin/assignments', label: 'Assignments', icon: 'Truck' },
  { href: '/admin/pricing', label: 'Pricing', icon: 'WalletCards' },
  { href: '/admin/staff', label: 'Staff', icon: 'UserRound' }
]

export default function AdminPricingPage() {
  return (
    <PortalShell title="Pricing Management" subtitle="Management panel" nav={nav}>
      <AdminPricing />
    </PortalShell>
  )
}
