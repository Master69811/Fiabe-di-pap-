'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef, use } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { AudioPlayer } from '@/components/AudioPlayer'
import { getStoryById } from '@/lib/stories-catalog'
import { CATEGORY_MUSIC } from '@/lib/music-catalog'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, AlertCircle, Sparkles, Music, VolumeOff, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Story, StoryDuration } from '@/types'
import { DURATION_OPTIONS as OPTS, CATEGORY_META } from '@/types'

interface PageProps {
  params: Promise<{ storyId: string }>
}

const DEFAULT_VOICE_ID = 'Au9QDigs0anA5pmgPwLo'

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
  const childId = searchParams.get('childId') || undefined
  const duration = (searchParams.get('duration') || 'classic') as StoryDuration

  const [story, setStory] = useState<Story | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [voiceId, setVoiceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingAudio, setGeneratingAudio] = useState(false)
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const [waitingForStart, setWaitingForStart] = useState(false)
  const [musicEnabled, setMusicEnabled] = useState(true)

  // Pre-generazione in background durante la schermata musica
  const pregenRef = useRef<Promise<string | null> | null>(null)
  const pregenUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!generatingAudio) return
    const interval = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % loadingMessages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [generatingAudio])

  const buildAudio = async (storyObj: Story, vid: string): Promise<string | null> => {
    try {
      let content = storyObj.content
      if (duration !== 'classic') {
        const adaptRes = await fetch('/api/voice/adapt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storyId: storyObj.id, duration }),
        })
        if (adaptRes.ok) {
          const d = await adaptRes.json()
          if (d.content) content = d.content
        }
      }
      const res = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: storyObj.id, childName, voiceId: vid, customContent: content, durationKey: duration }),
      })
      const data = await res.json()
      return data.audioUrl ?? null
    } catch {
      return null
    }
  }

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
      if (!user) { router.push('/login'); return }

      // Auth check e family fetch in parallelo con pre-generazione
      const { data: family } = await supabase
        .from('families')
        .select('elevenlabs_voice_id')
        .eq('user_id', user.id)
        .maybeSingle()

      const vid = family?.elevenlabs_voice_id || DEFAULT_VOICE_ID
      setVoiceId(vid)
      setLoading(false)
      setWaitingForStart(true)

      // Avvia pre-generazione in background SUBITO (mentre l'utente sceglie la musica)
      const prom = buildAudio(found, vid)
      pregenRef.current = prom
      prom.then((url) => {
        if (url) pregenUrlRef.current = url
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId, router])

  const startStory = async () => {
    if (!story || !voiceId) return
    setWaitingForStart(false)

    // Logga la sessione in background (fire-and-forget)
    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId: story.id, childProfileId: childId }),
    }).catch(() => null)

    // Se la pre-generazione è già completata → player immediato!
    if (pregenUrlRef.current) {
      setAudioUrl(pregenUrlRef.current)
      return
    }

    // Altrimenti aspetta il promise già avviato (non richiede nuovo fetch)
    setGeneratingAudio(true)
    try {
      const url = pregenRef.current ? await pregenRef.current : await buildAudio(story, voiceId)
      if (url) {
        setAudioUrl(url)
      } else {
        setError('Errore nella generazione audio. Riprova.')
      }
    } catch {
      setError('Errore di rete. Riprova.')
    } finally {
      setGeneratingAudio(false)
    }
  }

  const durationOpt = OPTS.find((o) => o.key === duration)
  const categoryMeta = story ? CATEGORY_META[story.category] : null
  const backgroundMusicUrl = story && musicEnabled
    ? (story.music_url ?? CATEGORY_MUSIC[story.category])
    : undefined

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #f3e8ff 0%, #fdf4ff 100%)' }}>
        <div className="text-center space-y-3">
          <motion.div className="text-6xl mx-auto w-fit"
            animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            🦉
          </motion.div>
          <p className="font-semibold" style={{ color: '#7c3aed' }}>Caricamento...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'linear-gradient(180deg, #f3e8ff 0%, #fdf4ff 100%)' }}>
        <div className="max-w-sm text-center space-y-4">
          <AlertCircle size={48} className="mx-auto text-red-500" />
          <h2 className="text-xl font-bold" style={{ color: '#4c1d95' }}>Qualcosa è andato storto</h2>
          <p className="text-red-600 text-sm">{error}</p>
          <Button onClick={() => router.back()} className="rounded-2xl">Torna indietro</Button>
        </div>
      </div>
    )
  }

  if (!story) return null

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #f3e8ff 0%, #fdf4ff 40%, #fff9ff 100%)' }}>

      <div className="px-4 pt-4 flex items-center gap-3">
        <Link href="/dashboard"
          className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
          style={{ color: '#7c3aed' }}>
          <ArrowLeft size={14} /> Torna al catalogo
        </Link>
        {categoryMeta && (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full ml-auto"
            style={{ backgroundColor: categoryMeta.color + '22', color: categoryMeta.color }}>
            {categoryMeta.emoji} {categoryMeta.label}
          </span>
        )}
        {durationOpt && (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
            {durationOpt.emoji} {durationOpt.minutes}
          </span>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">

          {waitingForStart ? (
            <motion.div key="start" className="text-center space-y-8 max-w-sm w-full"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>

              <motion.div className="text-9xl mx-auto w-fit"
                animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                {story.cover_emoji}
              </motion.div>

              <div>
                <h2 className="text-3xl font-black mb-1" style={{ color: '#4c1d95' }}>{story.title}</h2>
                {childName && <p className="text-lg" style={{ color: '#7c3aed' }}>Una storia per {childName} 💛</p>}
              </div>

              <div className="rounded-2xl border p-5 space-y-4"
                style={{ borderColor: '#e9d5ff', backgroundColor: 'white' }}>
                <p className="text-sm font-bold" style={{ color: '#4c1d95' }}>🎵 Sottofondo musicale</p>
                <div className="flex gap-3">
                  <button onClick={() => setMusicEnabled(true)}
                    className="flex-1 rounded-xl py-3 px-4 text-sm font-semibold border-2 transition-all"
                    style={{
                      borderColor: musicEnabled ? '#7c3aed' : '#e9d5ff',
                      backgroundColor: musicEnabled ? '#f3e8ff' : 'white',
                      color: musicEnabled ? '#7c3aed' : '#9ca3af',
                    }}>
                    <Music size={16} className="mx-auto mb-1" />
                    Musica ON
                  </button>
                  <button onClick={() => setMusicEnabled(false)}
                    className="flex-1 rounded-xl py-3 px-4 text-sm font-semibold border-2 transition-all"
                    style={{
                      borderColor: !musicEnabled ? '#7c3aed' : '#e9d5ff',
                      backgroundColor: !musicEnabled ? '#f3e8ff' : 'white',
                      color: !musicEnabled ? '#7c3aed' : '#9ca3af',
                    }}>
                    <VolumeOff size={16} className="mx-auto mb-1" />
                    Solo voce
                  </button>
                </div>
                {musicEnabled && (
                  <p className="text-xs text-center" style={{ color: '#a78bfa' }}>
                    Suono ambientale dolce al 8% del volume
                  </p>
                )}
              </div>

              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={startStory}
                className="w-full py-5 rounded-2xl text-lg font-black text-white shadow-xl flex items-center justify-center gap-3"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)' }}>
                <Play size={22} style={{ marginLeft: 2 }} />
                Inizia la storia ✨
              </motion.button>

              <p className="text-xs" style={{ color: '#a78bfa' }}>
                ✨ L&apos;audio si prepara già in questo momento
              </p>
            </motion.div>

          ) : generatingAudio ? (
            <motion.div key="loading" className="text-center space-y-6 max-w-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              <motion.div className="text-8xl mx-auto w-fit"
                animate={{ y: [0, -14, 0], rotate: [0, 4, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                {story.cover_emoji}
              </motion.div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold" style={{ color: '#4c1d95' }}>{story.title}</h2>
                {childName && <p style={{ color: '#7c3aed' }}>Per {childName} 💛</p>}
              </div>

              <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: '#f3e8ff' }}>
                <div className="flex items-center justify-center gap-2">
                  <Sparkles size={16} style={{ color: '#7c3aed' }} className="animate-pulse" />
                  <AnimatePresence mode="wait">
                    <motion.p key={loadingMsgIdx} className="text-sm font-semibold"
                      style={{ color: '#4c1d95' }}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}>
                      {loadingMessages[loadingMsgIdx]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#e9d5ff' }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #7c3aed, #c026d3)' }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />
                </div>
              </div>

              <p className="text-xs" style={{ color: '#a78bfa' }}>
                Le volte successive sarà istantaneo grazie alla cache.
              </p>
            </motion.div>

          ) : audioUrl ? (
            <motion.div key="player" className="w-full max-w-lg"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <AudioPlayer
                audioUrl={audioUrl}
                storyTitle={story.title}
                childName={childName}
                coverEmoji={story.cover_emoji}
                coverColor={story.cover_color}
                backgroundMusicUrl={backgroundMusicUrl}
              />
            </motion.div>
          ) : null}

        </AnimatePresence>
      </div>
    </div>
  )
}
