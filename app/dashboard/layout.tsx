import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookOpen, User, Home, Mic } from 'lucide-react'
import { SignOutButton } from './sign-out-button'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const displayName =
    user.user_metadata?.full_name ??
    user.email?.split('@')[0] ??
    'Utente'

  const avatarInitial = displayName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #f3e8ff 0%, #fdf4ff 40%, #fff9ff 100%)' }}>
      {/* Top nav */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-sm"
        style={{
          backgroundColor: 'rgba(253,244,255,0.95)',
          borderColor: '#e9d5ff',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <BookOpen size={24} style={{ color: '#7c3aed' }} />
            <span
              className="font-black text-lg hidden sm:block"
              style={{
                background: 'linear-gradient(90deg, #7c3aed, #c026d3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Fiabe di Papà
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-purple-50"
              style={{ color: '#6d28d9' }}
            >
              <Home size={16} />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link
              href="/voice-setup"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-purple-50"
              style={{ color: '#6d28d9' }}
            >
              <Mic size={16} />
              <span className="hidden sm:inline">Voce</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-purple-50"
              style={{ color: '#6d28d9' }}
            >
              <User size={16} />
              <span className="hidden sm:inline">Profilo</span>
            </Link>
          </nav>

          {/* User avatar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}
              >
                {avatarInitial}
              </div>
              <span
                className="text-sm font-semibold hidden md:block max-w-[120px] truncate"
                style={{ color: '#6d28d9' }}
              >
                {displayName}
              </span>
            </div>

            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
