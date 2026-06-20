import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function getServerSupabase() {
  return createClient()
}

function getAdminSupabase() {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null
    return createAdminClient()
  } catch {
    return null
  }
}

async function ensureFamily(userId: string): Promise<{ id: string | null; error?: string }> {
  const supabase = await getServerSupabase()

  // Step 1: prova SELECT con il client normale (funziona con RLS per SELECT)
  const { data: existing } = await supabase
    .from('families')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing?.id) return { id: existing.id }

  // Step 2: prova INSERT via admin client (bypassa RLS)
  const admin = getAdminSupabase()
  if (admin) {
    const { data: created, error: adminErr } = await admin
      .from('families')
      .insert({ user_id: userId })
      .select('id')
      .single()

    if (!adminErr && created?.id) return { id: created.id }

    // Famiglia potrebbe già esistere (race condition o admin SELECT fallito prima)
    const { data: retry } = await admin
      .from('families')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (retry?.id) return { id: retry.id }

    console.error('Admin INSERT error:', adminErr?.message)
    return { id: null, error: `DB error: ${adminErr?.message}` }
  }

  // Step 3: fallback INSERT via client normale (funziona se RLS ha WITH CHECK)
  const { data: created, error: clientErr } = await supabase
    .from('families')
    .insert({ user_id: userId })
    .select('id')
    .single()

  if (!clientErr && created?.id) return { id: created.id }

  // Step 4: prova upsert come ultima risorsa
  const { data: upserted, error: upsertErr } = await supabase
    .from('families')
    .upsert({ user_id: userId }, { onConflict: 'user_id' })
    .select('id')
    .single()

  if (!upsertErr && upserted?.id) return { id: upserted.id }

  console.error('All family creation attempts failed:', clientErr?.message, upsertErr?.message)
  return {
    id: null,
    error: clientErr?.message || upsertErr?.message || 'Impossibile creare la famiglia',
  }
}

export async function GET() {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const admin = getAdminSupabase()
  const db = admin ?? supabase

  const { data: family } = await db
    .from('families')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!family) return NextResponse.json({ children: [], familyId: null })

  const { data: children, error } = await db
    .from('child_profiles')
    .select('*')
    .eq('family_id', family.id)
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ children: children ?? [], familyId: family.id })
}

export async function POST(request: NextRequest) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo non valido' }, { status: 400 })
  }

  const { name, age, gender, favorite_themes, avatar_emoji, editId } = body as {
    name: string
    age: string
    gender: string
    favorite_themes: string[]
    avatar_emoji: string
    editId?: string
  }

  if (!name?.trim() || !age) {
    return NextResponse.json({ error: 'Nome e età sono obbligatori' }, { status: 400 })
  }

  const { id: familyId, error: familyError } = await ensureFamily(user.id)
  if (!familyId) {
    return NextResponse.json(
      { error: `Errore famiglia: ${familyError ?? 'sconosciuto'}. Aggiungi SUPABASE_SERVICE_ROLE_KEY su Vercel.` },
      { status: 500 }
    )
  }

  const admin = getAdminSupabase()
  const db = admin ?? supabase

  const payload = {
    name: String(name).trim(),
    age: parseInt(String(age)),
    gender: gender ?? 'other',
    favorite_themes: Array.isArray(favorite_themes) ? favorite_themes : [],
    avatar_emoji: avatar_emoji ?? '🧒',
    family_id: familyId,
  }

  if (editId) {
    const { data, error } = await db
      .from('child_profiles')
      .update(payload)
      .eq('id', editId)
      .eq('family_id', familyId)
      .select()
      .single()
    if (error) return NextResponse.json({ error: 'Errore modifica: ' + error.message }, { status: 500 })
    return NextResponse.json({ child: data, familyId })
  }

  const { data, error } = await db
    .from('child_profiles')
    .insert(payload)
    .select()
    .single()
  if (error) return NextResponse.json({ error: 'Errore salvataggio: ' + error.message }, { status: 500 })
  return NextResponse.json({ child: data, familyId })
}

export async function DELETE(request: NextRequest) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID mancante' }, { status: 400 })

  const admin = getAdminSupabase()
  const db = admin ?? supabase

  const { data: family } = await db
    .from('families')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!family) return NextResponse.json({ error: 'Famiglia non trovata' }, { status: 404 })

  const { error } = await db
    .from('child_profiles')
    .delete()
    .eq('id', id)
    .eq('family_id', family.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
