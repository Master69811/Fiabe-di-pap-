import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateVoiceId } from '@/lib/elevenlabs'

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
  if (!voiceId) {
    return NextResponse.json({ error: 'voiceId obbligatorio' }, { status: 400 })
  }

  const isValid = await validateVoiceId(voiceId)
  if (!isValid) {
    return NextResponse.json(
      { error: 'Voice ID non valido. Verifica di averlo copiato correttamente da ElevenLabs.' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('families')
    .update({ elevenlabs_voice_id: voiceId, has_voice_setup: true })
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Errore nel salvataggio' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
