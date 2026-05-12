import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import 'leaflet/dist/leaflet.css'

export const metadata: Metadata = {
  title: 'IRONMAN Laundry',
  description: 'Online laundry, dry cleaning, ironing, delivery tracking, and fully logged COD payments for Dhaka customers.',
  keywords: 'laundry, dry cleaning, ironing, Dhaka, Bangladesh, doorstep delivery, IRONMAN',
  openGraph: {
    title: 'IRONMAN Laundry',
    description: 'Premium online laundry and dry cleaning service in Dhaka.',
    type: 'website'
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
