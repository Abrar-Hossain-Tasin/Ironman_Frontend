import { AdminStaff } from '@/components/admin/admin-staff'
import { PortalShell } from '@/components/layout/portal-shell'

const nav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/admin/orders', label: 'Orders', icon: 'ListChecks' },
  { href: '/admin/assignments', label: 'Assignments', icon: 'Truck' },
  { href: '/admin/pricing', label: 'Pricing', icon: 'WalletCards' },
  { href: '/admin/staff', label: 'Staff', icon: 'UserRound' }
]

export default function AdminStaffPage() {
  return (
    <PortalShell title="Staff Management" subtitle="Management panel" nav={nav}>
      <AdminStaff />
    </PortalShell>
  )
}
