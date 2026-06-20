import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  // Upsert: crea la famiglia se non esiste, poi aggiorna il voice ID
  const { error: upsertErr } = await supabase
    .from('families')
    .upsert({ user_id: user.id }, { onConflict: 'user_id' })

  if (upsertErr) {
    console.error('Upsert family error:', upsertErr)
  }

  const { error } = await supabase
    .from('families')
    .update({ elevenlabs_voice_id: voiceId.trim(), has_voice_setup: true })
    .eq('user_id', user.id)

  if (error) {
    console.error('Voice save error:', error)
    return NextResponse.json({ error: 'Errore nel salvataggio: ' + error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
