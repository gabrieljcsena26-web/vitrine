import type { Metadata } from 'next'
import './globals.css'
import { getBaseUrl } from '@/lib/utils'

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: 'Vitrine — Generate your business page in 60 seconds',
  description: 'Auto-generate beautiful landing pages for local businesses in seconds. No code needed.',
  openGraph: {
    title: 'Vitrine — Landing pages for local businesses',
    description: 'Beautiful mobile-first pages with WhatsApp leads, tracking and dashboards for local businesses.',
    type: 'website',
    siteName: 'Vitrine',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vitrine — Landing pages for local businesses',
    description: 'Beautiful mobile-first pages with WhatsApp leads, tracking and dashboards for local businesses.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
