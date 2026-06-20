import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VOICE_ID = 'Au9QDigs0anA5pmgPwLo'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr || !user) {
    return new NextResponse(
      '<html><body style="font-family:sans-serif;padding:2rem"><h2>❌ Non autorizzato</h2><p>Effettua prima il <a href="/login">login</a>.</p></body></html>',
      { status: 401, headers: { 'Content-Type': 'text/html' } }
    )
  }

  // Crea la famiglia se non esiste
  await supabase
    .from('families')
    .upsert({ user_id: user.id }, { onConflict: 'user_id' })

  // Salva il Voice ID
  const { error } = await supabase
    .from('families')
    .update({ elevenlabs_voice_id: VOICE_ID, has_voice_setup: true })
    .eq('user_id', user.id)

  if (error) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:2rem"><h2>❌ Errore</h2><pre>${error.message}</pre></body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    )
  }

  const origin = new URL(request.url).origin
  return NextResponse.redirect(origin + '/dashboard')
}
