import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { PublicTracker } from '@/components/orders/public-tracker'

export default function TrackPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-ironman-navy-50">
        <section className="container-page py-12">
          <PublicTracker />
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
