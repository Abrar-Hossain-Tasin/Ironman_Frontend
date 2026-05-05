export function SiteFooter() {
  return (
    <footer className="bg-ironman-navy text-white">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="text-xl font-bold">IRONMAN</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
            Doorstep laundry, dry cleaning, ironing, delivery tracking, and fully logged COD payments for Dhaka customers.
          </p>
        </div>
        <div>
          <p className="font-semibold">Contact</p>
          <p className="mt-3 text-sm text-white/80">Dhaka, Bangladesh</p>
          <p className="mt-1 text-sm text-white/80">support@ironman.local</p>
        </div>
        <div>
          <p className="font-semibold">Hours</p>
          <p className="mt-3 text-sm text-white/80">Pickup: 9:00 AM - 8:00 PM</p>
          <p className="mt-1 text-sm text-white/80">Delivery: 10:00 AM - 9:00 PM</p>
        </div>
      </div>
    </footer>
  )
}
