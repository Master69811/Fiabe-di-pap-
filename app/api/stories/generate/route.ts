import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCustomStory } from '@/lib/openai-client'
import { z } from 'zod'

const schema = z.object({
  childName: z.string().min(1),
  age: z.number().min(2).max(12),
  theme: z.string().min(1),
  duration: z.union([z.literal(5), z.literal(10), z.literal(15)]),
  moral: z.string().optional(),
  favoriteCharacter: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo della richiesta non valido' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parametri non validi', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const story = await generateCustomStory(parsed.data)
    return NextResponse.json(story)
  } catch (err) {
    console.error('OpenAI generation error:', err)
    return NextResponse.json(
      { error: 'Errore nella generazione della storia. Controlla la tua API key di OpenAI.' },
      { status: 502 }
    )
  }
}
