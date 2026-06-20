'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="p-2 rounded-xl transition-colors hover:bg-[#f5ede0]"
      style={{ color: 'var(--muted-foreground)' }}
      title="Esci"
    >
      <LogOut size={16} />
    </button>
  )
}
