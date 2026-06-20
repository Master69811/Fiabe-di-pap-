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

      const { data: family } = await supabase
        .from('families')
        .select('elevenlabs_voice_id')
        .eq('user_id', user.id)
        .maybeSingle()

      const vid = family?.elevenlabs_voice_id || DEFAULT_VOICE_ID
      setVoiceId(vid)
      setLoading(false)
      setWaitingForStart(true)

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

    fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId: story.id, childProfileId: childId }),
    }).catch(() => null)

    if (pregenUrlRef.current) {
      setAudioUrl(pregenUrlRef.current)
      return
    }

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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div className="text-center space-y-3">
          <motion.div
            className="text-5xl mx-auto w-fit"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🦉
          </motion.div>
          <p className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>Caricamento...</p>
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
          <AlertCircle size={40} className="mx-auto" style={{ color: '#fb7185' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Qualcosa è andato storto</h2>
          <p className="text-sm" style={{ color: '#fb7185' }}>{error}</p>
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
      {/* Top nav */}
      <div className="px-6 pt-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ArrowLeft size={13} /> Catalogo
        </Link>
        <div className="flex-1" />
        {categoryMeta && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded"
            style={{ backgroundColor: categoryMeta.color + '22', color: categoryMeta.color }}
          >
            {categoryMeta.emoji} {categoryMeta.label}
          </span>
        )}
        {durationOpt && (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded"
            style={{ backgroundColor: 'var(--surface-2)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
          >
            {durationOpt.emoji} {durationOpt.minutes}
          </span>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">

          {waitingForStart ? (
            <motion.div
              key="start"
              className="text-center space-y-6 max-w-sm w-full"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            >
              <motion.div
                className="text-8xl mx-auto w-fit"
                animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {story.cover_emoji}
              </motion.div>

              <div>
                <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--foreground)' }}>{story.title}</h2>
                {childName && (
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Una storia per {childName} 💛</p>
                )}
              </div>

              {/* Music selector */}
              <div
                className="rounded-lg p-4 space-y-3"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                  🎵 Sottofondo musicale
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMusicEnabled(true)}
                    className="flex-1 rounded py-2.5 px-3 text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors"
                    style={{
                      backgroundColor: musicEnabled ? 'rgba(232,121,249,0.1)' : 'var(--surface-2)',
                      border: `1px solid ${musicEnabled ? 'rgba(232,121,249,0.4)' : 'var(--border)'}`,
                      color: musicEnabled ? '#e879f9' : 'var(--muted-foreground)',
                    }}
                  >
                    <Music size={15} />
                    Musica ON
                  </button>
                  <button
                    onClick={() => setMusicEnabled(false)}
                    className="flex-1 rounded py-2.5 px-3 text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors"
                    style={{
                      backgroundColor: !musicEnabled ? 'rgba(232,121,249,0.1)' : 'var(--surface-2)',
                      border: `1px solid ${!musicEnabled ? 'rgba(232,121,249,0.4)' : 'var(--border)'}`,
                      color: !musicEnabled ? '#e879f9' : 'var(--muted-foreground)',
                    }}
                  >
                    <VolumeOff size={15} />
                    Solo voce
                  </button>
                </div>
                {musicEnabled && (
                  <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                    Suono ambientale dolce all&apos;8% del volume
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={startStory}
                className="w-full py-4 rounded-lg text-base font-black text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #a855f7, #e879f9)' }}
              >
                <Play size={20} style={{ marginLeft: 2 }} />
                Inizia la storia
              </motion.button>

              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                ✨ L&apos;audio si prepara già in questo momento
              </p>
            </motion.div>

          ) : generatingAudio ? (
            <motion.div
              key="loading"
              className="text-center space-y-5 max-w-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-7xl mx-auto w-fit"
                animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                {story.cover_emoji}
              </motion.div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{story.title}</h2>
                {childName && <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Per {childName} 💛</p>}
              </div>

              <div
                className="rounded-lg p-4 space-y-3"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles size={14} style={{ color: '#e879f9' }} className="animate-pulse" />
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingMsgIdx}
                      className="text-sm font-semibold"
                      style={{ color: 'var(--foreground)' }}
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                    >
                      {loadingMessages[loadingMsgIdx]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-2)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #a855f7, #e879f9)' }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </div>

              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Le volte successive sarà istantaneo grazie alla cache.
              </p>
            </motion.div>

          ) : audioUrl ? (
            <motion.div
              key="player"
              className="w-full max-w-lg"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            >
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
