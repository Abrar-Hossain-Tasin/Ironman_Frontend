import Link from 'next/link'
import { Menu, UserRound } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/track', label: 'Track' }
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ironman-navy-100 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 font-bold text-ironman-navy">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ironman-navy text-white">
            IM
          </span>
          <span className="text-lg">IRONMAN</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-ironman-navy md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ironman-red">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="tap-target focus-ring inline-flex items-center justify-center rounded-lg border border-ironman-navy px-4 py-2 text-sm font-semibold text-ironman-navy"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="tap-target focus-ring inline-flex items-center justify-center rounded-lg bg-ironman-red px-4 py-2 text-sm font-semibold text-white"
          >
            Register
          </Link>
        </div>
        <button className="tap-target focus-ring inline-flex items-center justify-center rounded-lg text-ironman-navy md:hidden" type="button" aria-label="Open menu">
          <Menu className="h-6 w-6" aria-hidden />
        </button>
      </div>
      <div className="container-page flex gap-2 pb-3 md:hidden">
        <Link href="/login" className="tap-target focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-ironman-navy px-4 py-2 text-sm font-semibold text-ironman-navy">
          <UserRound className="h-4 w-4" aria-hidden />
          Login
        </Link>
        <Link href="/register" className="tap-target focus-ring inline-flex flex-1 items-center justify-center rounded-lg bg-ironman-red px-4 py-2 text-sm font-semibold text-white">
          Register
        </Link>
      </div>
    </header>
  )
}
