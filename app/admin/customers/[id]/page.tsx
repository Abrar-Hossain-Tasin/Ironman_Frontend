import { AdminCustomerDetail } from '@/components/admin/admin-customer-detail'
import { adminNav } from '@/components/admin/admin-nav'
import { PortalShell } from '@/components/layout/portal-shell'

export default function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  return (
    <PortalShell title="Customer 360" subtitle="Management panel" nav={adminNav}>
      <AdminCustomerDetail customerId={params.id} />
    </PortalShell>
  )
}
