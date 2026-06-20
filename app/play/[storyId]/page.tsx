'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, use } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { AudioPlayer } from '@/components/AudioPlayer'
import { getStoryById } from '@/lib/stories-catalog'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, AlertCircle, Loader2, Mic, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Story, StoryDuration, DURATION_OPTIONS } from '@/types'
import { DURATION_OPTIONS as OPTS, CATEGORY_META } from '@/types'

interface PageProps {
  params: Promise<{ storyId: string }>
}

const loadingMessages = [
  'La voce si scalda...',
  'Apro il libro delle storie...',
  'La magia è quasi pronta...',
  'Sto preparando la storia per te...',
  'Ancora un secondo di pazienza...',
]

export default function PlayPage({ params }: PageProps) {
  const { storyId } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()

  const childName = searchParams.get('child') || undefined
  const duration = (searchParams.get('duration') || 'classic') as StoryDuration

  const [story, setStory] = useState<Story | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [voiceId, setVoiceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingAudio, setGeneratingAudio] = useState(false)
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)

  // Ruota i messaggi di attesa ogni 4 secondi
  useEffect(() => {
    if (!generatingAudio) return
    const interval = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % loadingMessages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [generatingAudio])

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

    // Se duration != 'classic', prima adattiamo il testo poi generiamo l'audio
    const generateWithDuration = async () => {
      try {
        let content = story.content

        if (duration !== 'classic') {
          const adaptRes = await fetch('/api/voice/adapt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storyId: story.id, duration }),
          })
          if (adaptRes.ok) {
            const adaptData = await adaptRes.json()
            if (adaptData.content) content = adaptData.content
          }
        }

        const res = await fetch('/api/voice/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storyId: story.id, childName, voiceId, customContent: content, durationKey: duration }),
        })
        const data = await res.json()
        if (data.audioUrl) {
          setAudioUrl(data.audioUrl)
        } else {
          setError(data.error || 'Errore nella generazione audio.')
        }
      } catch {
        setError('Errore di rete. Riprova.')
      } finally {
        setGeneratingAudio(false)
      }
    }

    generateWithDuration()
  }, [story, voiceId, childName, duration])

  const durationOpt = OPTS.find((o) => o.key === duration)
  const categoryMeta = story ? CATEGORY_META[story.category] : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center space-y-3">
          <motion.div
            className="text-6xl mx-auto w-fit"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🦉
          </motion.div>
          <p className="font-semibold" style={{ color: 'var(--muted-foreground)' }}>Caricamento...</p>
        </div>
      </div>
    )
  }

  if (error === 'no-voice') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-sm text-center space-y-6">
          <div className="text-7xl">🎙️</div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            Configura prima la tua voce
          </h2>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Per ascoltare le storie con la tua voce devi prima collegare il tuo profilo ElevenLabs.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => router.push('/voice-setup')} size="lg" className="rounded-2xl">
              <Mic size={18} className="mr-2" /> Configura la voce
            </Button>
            <Button variant="ghost" onClick={() => router.back()} className="rounded-2xl">
              Torna indietro
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-sm text-center space-y-4">
          <AlertCircle size={48} className="mx-auto text-red-500" />
          <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
            Qualcosa è andato storto
          </h2>
          <p className="text-red-600 text-sm">{error}</p>
          <Button onClick={() => router.back()} className="rounded-2xl">Torna indietro</Button>
        </div>
      </div>
    )
  }

  if (!story) return null

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Navbar */}
      <div className="px-4 pt-4 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ArrowLeft size={14} /> Torna al catalogo
        </Link>

        {/* Badge categoria */}
        {categoryMeta && (
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full ml-auto"
            style={{ backgroundColor: categoryMeta.color + '22', color: categoryMeta.color }}
          >
            {categoryMeta.emoji} {categoryMeta.label}
          </span>
        )}
        {durationOpt && (
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
          >
            {durationOpt.emoji} {durationOpt.minutes}
          </span>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {generatingAudio ? (
            <motion.div
              key="loading"
              className="text-center space-y-6 max-w-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Emoji copertina animata */}
              <motion.div
                className="text-8xl mx-auto w-fit"
                animate={{ y: [0, -14, 0], rotate: [0, 4, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                {story.cover_emoji}
              </motion.div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {story.title}
                </h2>
                {childName && (
                  <p style={{ color: 'var(--muted-foreground)' }}>Per {childName} 💛</p>
                )}
              </div>

              {/* Barra di attesa con messaggio rotante */}
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles size={16} style={{ color: 'var(--primary)' }} className="animate-pulse" />
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingMsgIdx}
                      className="text-sm font-semibold"
                      style={{ color: 'var(--foreground)' }}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}
                    >
                      {loadingMessages[loadingMsgIdx]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                {/* Progress bar indeterminata */}
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--border)' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, var(--primary), var(--primary-light))' }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </div>

              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                La prima volta richiede circa 30–60 secondi. Le volte successive sarà istantaneo.
              </p>
            </motion.div>
          ) : audioUrl ? (
            <motion.div
              key="player"
              className="w-full max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AudioPlayer
                audioUrl={audioUrl}
                storyTitle={story.title}
                childName={childName}
                coverEmoji={story.cover_emoji}
                coverColor={story.cover_color}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
