import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Alysa | AI Customer Success Engine',
  description: 'AI-powered Customer Success Growth Engine by Prioriwise',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
