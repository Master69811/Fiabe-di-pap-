import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getStoryById } from '@/lib/stories-catalog'
import { StoryDuration } from '@/types'

// Parametri di lunghezza per ogni modalità
const DURATION_PARAMS: Record<StoryDuration, { targetWords: number; instruction: string }> = {
  quick: {
    targetWords: 300,
    instruction:
      'Riassumi la storia in modo conciso mantenendo il messaggio principale e il finale. Usa frasi brevi, adatte a bambini. Circa 300 parole.',
  },
  classic: {
    targetWords: 500,
    instruction:
      'Mantieni la storia nella sua versione originale completa, adattandola leggermente se necessario. Circa 500 parole.',
  },
  adventure: {
    targetWords: 800,
    instruction:
      'Espandi la storia con scene aggiuntive: descrivi meglio i luoghi, aggiungi dialoghi tra i personaggi, approfondisci le emozioni. Circa 800 parole.',
  },
  bedtime: {
    targetWords: 1200,
    instruction:
      'Crea una versione molto lunga e rilassante. Aggiungi descrizioni dettagliate, momenti di calma, sensazioni sensoriali (profumi, suoni, temperature). Usa un ritmo lento e ipnotico pensato per addormentarsi. Circa 1200 parole. Concludi con una formula di buonanotte dolce.',
  },
}

function getClient() {
  // Lazy import per evitare errori a build time
  const { default: OpenAI } = require('openai') as typeof import('openai')
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const body = await request.json()
    const { storyId, duration } = body as { storyId: string; duration: StoryDuration }

    if (!storyId || !duration) {
      return NextResponse.json({ error: 'storyId e duration sono obbligatori' }, { status: 400 })
    }

    // La versione 'classic' restituisce il testo originale senza chiamare OpenAI
    const story = getStoryById(storyId)
    if (!story) {
      return NextResponse.json({ error: 'Storia non trovata' }, { status: 404 })
    }

    if (duration === 'classic') {
      return NextResponse.json({ content: story.content, adapted: false })
    }

    const params = DURATION_PARAMS[duration]
    const openai = getClient()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 2000,
      messages: [
        {
          role: 'system',
          content: `Sei un narratore esperto di fiabe per bambini in italiano.
Il tuo compito è adattare la lunghezza di una storia seguendo le istruzioni.
Mantieni lo stile fiabesco, la semplicità del linguaggio e il messaggio morale.
Restituisci SOLO il testo della storia adattata, senza titolo né commenti.`,
        },
        {
          role: 'user',
          content: `Adatta questa storia:\n\nTITOLO: ${story.title}\n\nTESTO:\n${story.content}\n\nISTRUZIONI: ${params.instruction}`,
        },
      ],
    })

    const adaptedContent = completion.choices[0]?.message?.content ?? story.content

    return NextResponse.json({ content: adaptedContent, adapted: true })
  } catch (err) {
    console.error('[adapt]', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
