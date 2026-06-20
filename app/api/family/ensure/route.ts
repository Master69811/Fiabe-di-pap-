import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  // SELECT — funziona sempre con RLS (user_id = auth.uid())
  let { data: family } = await supabase
    .from('families')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Se non esiste, prova a creare (funziona se RLS ha WITH CHECK o se admin key è disponibile)
  if (!family) {
    // Prova con admin client se disponibile
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const admin = createAdminClient()
        const { data: created } = await admin
          .from('families')
          .insert({ user_id: user.id })
          .select('*')
          .single()
        if (created) family = created
      } catch {
        // admin client non disponibile
      }
    }

    // Fallback: server client
    if (!family) {
      const { data: created } = await supabase
        .from('families')
        .insert({ user_id: user.id })
        .select('*')
        .single()
      if (created) family = created
    }
  }

  if (!family) return NextResponse.json({ family: null, children: [] })

  const { data: children } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('family_id', family.id)
    .order('created_at')

  return NextResponse.json({ family, children: children ?? [] })
}
