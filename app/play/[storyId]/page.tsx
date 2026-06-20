'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, use } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AudioPlayer } from '@/components/AudioPlayer'
import { getStoryById } from '@/lib/stories-catalog'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, AlertCircle, Loader2, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Story } from '@/types'

interface PageProps {
  params: Promise<{ storyId: string }>
}

export default function PlayPage({ params }: PageProps) {
  const { storyId } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const childName = searchParams.get('child') || undefined

  const [story, setStory] = useState<Story | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [voiceId, setVoiceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingAudio, setGeneratingAudio] = useState(false)

  useEffect(() => {
    const found = getStoryById(storyId)
    if (!found) {
      setError('Storia non trovata.')
      setLoading(false)
      return
    }
    setStory(found)

    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/login')
        return
      }
      const { data: family } = await supabase
        .from('families')
        .select('elevenlabs_voice_id, has_voice_setup')
        .eq('user_id', user.id)
        .single()

      if (!family?.has_voice_setup || !family?.elevenlabs_voice_id) {
        setError('no-voice')
        setLoading(false)
        return
      }

      setVoiceId(family.elevenlabs_voice_id)
      setLoading(false)
    })
  }, [storyId, router])

  useEffect(() => {
    if (!story || !voiceId) return
    setGeneratingAudio(true)

    fetch('/api/voice/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId: story.id, childName, voiceId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.audioUrl) {
          setAudioUrl(data.audioUrl)
        } else {
          setError(data.error || 'Errore nella generazione audio.')
        }
      })
      .catch(() => setError('Errore di rete. Riprova.'))
      .finally(() => setGeneratingAudio(false))
  }, [story, voiceId, childName])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center space-y-3">
          <Loader2 size={48} className="animate-spin mx-auto" style={{ color: 'var(--primary)' }} />
          <p style={{ color: 'var(--muted-foreground)' }}>Caricamento...</p>
        </div>
      </div>
    )
  }

  if (error === 'no-voice') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div className="max-w-sm text-center space-y-6">
          <Mic size={64} className="mx-auto" style={{ color: 'var(--primary)' }} />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            Configura prima la tua voce
          </h2>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Per ascoltare le storie con la tua voce devi prima collegare il tuo profilo
            ElevenLabs.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => router.push('/voice-setup')} size="lg">
              🎙️ Configura la voce
            </Button>
            <Button variant="ghost" onClick={() => router.back()}>
              Torna indietro
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div className="max-w-sm text-center space-y-4">
          <AlertCircle size={48} className="mx-auto text-red-500" />
          <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
            Qualcosa è andato storto
          </h2>
          <p className="text-red-600 text-sm">{error}</p>
          <Button onClick={() => router.back()}>Torna indietro</Button>
        </div>
      </div>
    )
  }

  if (!story) return null

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Back nav */}
      <div className="px-4 pt-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm hover:underline"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ArrowLeft size={14} /> Catalogo storie
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {generatingAudio ? (
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-8xl float-animation">{story.cover_emoji}</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {story.title}
              </h2>
              {childName && (
                <p style={{ color: 'var(--muted-foreground)' }}>
                  Per {childName} 💛
                </p>
              )}
            </div>
            <div className="flex items-center justify-center gap-3">
              <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                La voce sta preparando la storia...
              </p>
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              La prima volta richiede circa 30–60 secondi. Le volte successive sarà istantaneo.
            </p>
          </motion.div>
        ) : audioUrl ? (
          <motion.div
            className="w-full max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AudioPlayer
              audioUrl={audioUrl}
              storyTitle={story.title}
              childName={childName}
              coverEmoji={story.cover_emoji}
            />
          </motion.div>
        ) : null}
      </div>
    </div>
  )
}
