import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  let body: { voiceId: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo non valido' }, { status: 400 })
  }

  const { voiceId } = body
  if (!voiceId || voiceId.trim().length < 10) {
    return NextResponse.json({ error: 'voiceId obbligatorio' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Ensure family exists using admin client (bypasses RLS)
  const { data: existing } = await admin
    .from('families')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existing) {
    await admin.from('families').insert({ user_id: user.id })
  }

  const { error } = await admin
    .from('families')
    .update({ elevenlabs_voice_id: voiceId.trim(), has_voice_setup: true })
    .eq('user_id', user.id)

  if (error) {
    console.error('Voice save error:', error)
    return NextResponse.json({ error: 'Errore nel salvataggio: ' + error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
