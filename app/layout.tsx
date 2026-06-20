import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fiabe di Papà – La tua voce racconta le sue storie',
  description:
    'Una piattaforma magica dove la tua voce narrata racconta fiabe personalizzate ai tuoi bambini. Clonazione vocale AI per creare ricordi indimenticabili.',
  keywords: ['fiabe', 'bambini', 'voce', 'storie', 'nanna', 'personalizzate', 'AI'],
  openGraph: {
    title: 'Fiabe di Papà',
    description: 'La tua voce. Le sue storie.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
