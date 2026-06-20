import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function ensureFamily(userId: string): Promise<string | null> {
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('families')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created, error } = await admin
    .from('families')
    .insert({ user_id: userId })
    .select('id')
    .single()

  if (error) {
    console.error('Family create error:', error)
    return null
  }
  return created.id
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const admin = createAdminClient()

  const { data: family } = await admin
    .from('families')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!family) return NextResponse.json({ children: [], familyId: null })

  const { data: children, error } = await admin
    .from('child_profiles')
    .select('*')
    .eq('family_id', family.id)
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ children: children ?? [], familyId: family.id })
}

export async function POST(request: NextRequest) {
  const user = await getUser()
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

  const familyId = await ensureFamily(user.id)
  if (!familyId) {
    return NextResponse.json({ error: 'Impossibile creare il profilo famiglia. Contatta il supporto.' }, { status: 500 })
  }

  const admin = createAdminClient()
  const payload = {
    name: String(name).trim(),
    age: parseInt(String(age)),
    gender: gender ?? 'other',
    favorite_themes: Array.isArray(favorite_themes) ? favorite_themes : [],
    avatar_emoji: avatar_emoji ?? '🧒',
    family_id: familyId,
  }

  if (editId) {
    const { data, error } = await admin
      .from('child_profiles')
      .update(payload)
      .eq('id', editId)
      .eq('family_id', familyId)
      .select()
      .single()
    if (error) return NextResponse.json({ error: 'Errore modifica: ' + error.message }, { status: 500 })
    return NextResponse.json({ child: data, familyId })
  }

  const { data, error } = await admin
    .from('child_profiles')
    .insert(payload)
    .select()
    .single()
  if (error) return NextResponse.json({ error: 'Errore salvataggio: ' + error.message }, { status: 500 })
  return NextResponse.json({ child: data, familyId })
}

export async function DELETE(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID mancante' }, { status: 400 })

  const admin = createAdminClient()

  const { data: family } = await admin
    .from('families')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!family) return NextResponse.json({ error: 'Famiglia non trovata' }, { status: 404 })

  const { error } = await admin
    .from('child_profiles')
    .delete()
    .eq('id', id)
    .eq('family_id', family.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
