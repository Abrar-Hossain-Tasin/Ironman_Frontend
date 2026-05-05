import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { PublicCatalog } from '@/components/public/public-catalog'

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-ironman-navy-50">
        <section className="container-page py-12">
          <p className="text-xs font-medium uppercase tracking-wide text-ironman-red">Pricing</p>
          <h1 className="mt-2 text-4xl font-bold text-ironman-navy">BDT pricing by clothing type</h1>
          <PublicCatalog mode="pricing" />
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
