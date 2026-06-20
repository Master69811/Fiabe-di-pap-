import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const admin = createAdminClient()

  let { data: family } = await admin
    .from('families')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!family) {
    const { data: created, error } = await admin
      .from('families')
      .insert({ user_id: user.id })
      .select('*')
      .single()

    if (error) {
      console.error('Family ensure error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    family = created
  }

  const { data: children } = await admin
    .from('child_profiles')
    .select('*')
    .eq('family_id', family!.id)
    .order('created_at')

  return NextResponse.json({ family, children: children ?? [] })
}
