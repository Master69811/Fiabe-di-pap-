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
    return NextResponse.json({ error: 'voiceId obbligatorio (min 10 caratteri)' }, { status: 400 })
  }

  // Controlla se la famiglia esiste già
  const { data: existing } = await supabase
    .from('families')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  // Se non esiste, prova a crearla
  if (!existing) {
    await supabase
      .from('families')
      .insert({ user_id: user.id })
  }

  // Aggiorna il voice ID (funziona sia con famiglia nuova che esistente)
  const { error } = await supabase
    .from('families')
    .update({ elevenlabs_voice_id: voiceId.trim(), has_voice_setup: true })
    .eq('user_id', user.id)

  if (error) {
    console.error('Voice save error:', error.message)
    // Se l'update fallisce perché non c'è la famiglia (RLS blocca INSERT), suggerisci la soluzione
    if (error.message.includes('No rows') || error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Profilo famiglia non trovato. Contatta il supporto o prova a rientrare nell\'app.' },
        { status: 500 }
      )
    }
    return NextResponse.json({ error: 'Errore nel salvataggio: ' + error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
