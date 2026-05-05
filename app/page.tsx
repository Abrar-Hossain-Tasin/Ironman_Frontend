import Link from 'next/link'
import { CheckCircle2, PackageCheck, Shirt, Truck } from 'lucide-react'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { PublicCatalog } from '@/components/public/public-catalog'

const steps = [
  { title: 'Order', body: 'Choose clothing, services, pickup slot, and notes.', icon: PackageCheck },
  { title: 'Pickup', body: 'Delivery man accepts, starts, and confirms pickup.', icon: Truck },
  { title: 'Process', body: 'Wash, dry clean, steam, and iron tasks are logged.', icon: Shirt },
  { title: 'Deliver', body: 'COD collection and delivery completion are recorded.', icon: CheckCircle2 }
]

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-ironman-navy text-white">
          <div className="absolute inset-0 opacity-25">
            <img
              src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1800&q=80"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="container-page relative grid min-h-[620px] items-center gap-8 py-16 lg:grid-cols-[1fr_420px]">
            <div>
              <p className="font-bangla text-xl font-semibold text-white/90">পরিচ্ছন্নতায় আনে সজীবতা</p>
              <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-tight text-white md:text-6xl">
                IRONMAN
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
                Online laundry, dry cleaning, ironing, pickup delivery, live order tracking, and fully logged cash-on-delivery payments.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/customer/orders/new" className="tap-target focus-ring inline-flex items-center justify-center rounded-lg bg-ironman-red px-5 py-3 font-semibold text-white">
                  Place Order
                </Link>
                <Link href="/track" className="tap-target focus-ring inline-flex items-center justify-center rounded-lg border border-white px-5 py-3 font-semibold text-white">
                  Track Order
                </Link>
              </div>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/95 p-5 text-ironman-navy shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-wide text-ironman-red">Today</p>
              <div className="mt-4 grid gap-3">
                {['Pickup assigned', 'In washing', 'Ready for delivery'].map((item, index) => (
                  <div key={item} className="flex items-center justify-between rounded-lg bg-ironman-navy-50 px-4 py-3">
                    <span className="font-semibold">{item}</span>
                    <span className="text-2xl font-bold">{[18, 9, 6][index]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container-page py-14">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ironman-red">Services</p>
              <h2 className="mt-2 text-3xl font-bold text-ironman-navy">Laundry care by item and service</h2>
            </div>
            <Link href="/pricing" className="font-semibold text-ironman-red">View full pricing</Link>
          </div>
          <PublicCatalog mode="home" />
        </section>

        <section className="bg-ironman-navy-50 py-14">
          <div className="container-page">
            <p className="text-xs font-medium uppercase tracking-wide text-ironman-red">How It Works</p>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {steps.map((step) => (
                <article key={step.title} className="rounded-lg bg-white p-5 shadow-soft">
                  <step.icon className="h-7 w-7 text-ironman-red" aria-hidden />
                  <h3 className="mt-4 text-lg font-bold text-ironman-navy">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container-page py-14">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wide text-ironman-red">Pricing</p>
            <h2 className="mt-2 text-3xl font-bold text-ironman-navy">BDT price grid</h2>
          </div>
          <PublicCatalog mode="pricing" />
        </section>

        <section className="bg-ironman-red-50 py-14">
          <div className="container-page grid gap-4 md:grid-cols-3">
            {['Fast pickup, clear communication, and perfect ironing.', 'I can track every status from pickup to delivery.', 'COD payment log makes the process transparent.'].map((quote) => (
              <blockquote key={quote} className="rounded-lg bg-white p-5 text-ironman-navy shadow-soft">
                <p className="text-lg font-semibold">&quot;{quote}&quot;</p>
                <footer className="mt-4 text-sm text-gray-500">IRONMAN customer</footer>
              </blockquote>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
