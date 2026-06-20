import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ storyIds: [] }, { status: 401 })

  const { data: family } = await supabase
    .from('families')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!family) return NextResponse.json({ storyIds: [] })

  const { data: sessions } = await supabase
    .from('story_sessions')
    .select('story_id')
    .eq('family_id', family.id)
    .order('listened_at', { ascending: false })

  const storyIds = [...new Set((sessions ?? []).map((s) => s.story_id))]
  return NextResponse.json({ storyIds })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { storyId, childProfileId } = await req.json()
  if (!storyId) return NextResponse.json({ error: 'storyId richiesto' }, { status: 400 })

  const { data: family } = await supabase
    .from('families')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!family) return NextResponse.json({ error: 'Famiglia non trovata' }, { status: 404 })

  await supabase.from('story_sessions').insert({
    family_id: family.id,
    child_profile_id: childProfileId || null,
    story_id: storyId,
    completed: false,
  })

  return NextResponse.json({ ok: true })
}
