import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vitrine — Generate your business page in 60 seconds',
  description: 'Auto-generate beautiful landing pages for local businesses in seconds. No code needed.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
