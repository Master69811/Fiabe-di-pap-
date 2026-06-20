'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  SkipBack,
  SkipForward,
  Music,
  VolumeOff,
  Clock,
} from 'lucide-react'

const MUSIC_VOLUME = 0.08
const MUSIC_FADE_MS = 1500
const SLEEP_OPTIONS = [null, 15, 30, 45] as const
type SleepOption = (typeof SLEEP_OPTIONS)[number]

interface AudioPlayerProps {
  audioUrl: string
  storyTitle: string
  childName?: string
  coverEmoji: string
  coverColor?: string
  backgroundMusicUrl?: string
  onComplete?: () => void
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function AudioPlayer({
  audioUrl,
  storyTitle,
  childName,
  coverEmoji,
  coverColor,
  backgroundMusicUrl,
  onComplete,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const musicRef = useRef<HTMLAudioElement>(null)
  const fadingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sleepRemainingRef = useRef(0)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [dimMode, setDimMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [musicOn, setMusicOn] = useState(true)
  const [sleepOption, setSleepOption] = useState<SleepOption>(null)
  const [sleepDisplay, setSleepDisplay] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onDurationChange = () => setDuration(audio.duration)
    const onEnded = () => {
      setIsPlaying(false)
      fadeOutMusic()
      setSleepOption(null)
      onComplete?.()
    }
    const onCanPlay = () => setIsLoading(false)
    const onWaiting = () => setIsLoading(true)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('canplay', onCanPlay)
    audio.addEventListener('waiting', onWaiting)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('canplay', onCanPlay)
      audio.removeEventListener('waiting', onWaiting)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onComplete])

  useEffect(() => {
    return () => {
      if (fadingRef.current) clearInterval(fadingRef.current)
      const music = musicRef.current
      if (music) { music.pause(); music.currentTime = 0 }
    }
  }, [])

  useEffect(() => {
    if (!isPlaying || sleepOption === null || sleepRemainingRef.current <= 0) return
    const id = setInterval(() => {
      sleepRemainingRef.current -= 1
      setSleepDisplay(sleepRemainingRef.current)
      if (sleepRemainingRef.current <= 0) {
        clearInterval(id)
        audioRef.current?.pause()
        setIsPlaying(false)
        fadeOutMusic()
        setSleepOption(null)
      }
    }, 1000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, sleepOption])

  const fadeInMusic = useCallback(() => {
    const music = musicRef.current
    if (!music || !backgroundMusicUrl || !musicOn) return
    if (fadingRef.current) clearInterval(fadingRef.current)
    music.volume = 0
    music.play().catch(() => null)
    const step = MUSIC_VOLUME / (MUSIC_FADE_MS / 50)
    fadingRef.current = setInterval(() => {
      if (!musicRef.current) return
      const next = Math.min(MUSIC_VOLUME, musicRef.current.volume + step)
      musicRef.current.volume = next
      if (next >= MUSIC_VOLUME) { clearInterval(fadingRef.current!); fadingRef.current = null }
    }, 50)
  }, [backgroundMusicUrl, musicOn])

  const fadeOutMusic = useCallback(() => {
    const music = musicRef.current
    if (!music) return
    if (fadingRef.current) clearInterval(fadingRef.current)
    const step = (music.volume || MUSIC_VOLUME) / (MUSIC_FADE_MS / 50)
    fadingRef.current = setInterval(() => {
      if (!musicRef.current) return
      const next = Math.max(0, musicRef.current.volume - step)
      musicRef.current.volume = next
      if (next <= 0) {
        clearInterval(fadingRef.current!); fadingRef.current = null
        musicRef.current.pause(); musicRef.current.currentTime = 0
      }
    }, 50)
  }, [])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause(); setIsPlaying(false); fadeOutMusic()
    } else {
      await audio.play(); setIsPlaying(true); fadeInMusic()
    }
  }, [isPlaying, fadeInMusic, fadeOutMusic])

  const toggleMusic = useCallback(() => {
    if (musicOn) { setMusicOn(false); fadeOutMusic() }
    else { setMusicOn(true); if (isPlaying) fadeInMusic() }
  }, [musicOn, isPlaying, fadeInMusic, fadeOutMusic])

  const cycleSleep = useCallback(() => {
    setSleepOption((prev) => {
      const idx = SLEEP_OPTIONS.indexOf(prev)
      const next = SLEEP_OPTIONS[(idx + 1) % SLEEP_OPTIONS.length]
      if (next === null) {
        sleepRemainingRef.current = 0
        setSleepDisplay(0)
      } else {
        sleepRemainingRef.current = next * 60
        setSleepDisplay(next * 60)
      }
      return next
    })
  }, [])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const val = Number(e.target.value)
    audio.currentTime = val; setCurrentTime(val)
  }, [])

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const val = Number(e.target.value)
    audio.volume = val; setVolume(val); setIsMuted(val === 0)
  }, [])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isMuted) { audio.volume = volume || 1; setIsMuted(false) }
    else { audio.volume = 0; setIsMuted(true) }
  }, [isMuted, volume])

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds))
  }, [duration])

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const coverBg = coverColor ?? 'linear-gradient(135deg, #a855f7 0%, #e879f9 100%)'
  const bgColor = dimMode ? '#05030d' : 'var(--background)'

  const sleepLabel = sleepOption === null
    ? null
    : sleepDisplay > 0
      ? formatTime(sleepDisplay)
      : `${sleepOption}m`

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 transition-colors duration-700"
      style={{ backgroundColor: bgColor }}
    >
      <audio ref={audioRef} src={audioUrl} preload="auto" />
      {backgroundMusicUrl && <audio ref={musicRef} src={backgroundMusicUrl} loop preload="none" />}

      <div className="w-full max-w-md mx-auto">
        {/* Top controls */}
        <div className="flex justify-end gap-2 mb-6">
          {/* Sleep timer */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={cycleSleep}
            className="h-8 rounded flex items-center justify-center gap-1.5 px-2.5 transition-colors"
            style={{
              backgroundColor: sleepOption !== null ? 'rgba(232,121,249,0.15)' : 'var(--surface-2)',
              color: sleepOption !== null ? '#e879f9' : 'var(--muted-foreground)',
              border: `1px solid ${sleepOption !== null ? 'rgba(232,121,249,0.3)' : 'var(--border)'}`,
              minWidth: '2rem',
            }}
            title={sleepOption === null ? 'Timer spegnimento' : `Spegni tra ${sleepLabel}`}
          >
            <Clock size={13} />
            {sleepLabel && <span className="text-xs font-bold tabular-nums">{sleepLabel}</span>}
          </motion.button>

          {/* Music toggle */}
          {backgroundMusicUrl && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleMusic}
              className="w-8 h-8 rounded flex items-center justify-center transition-colors"
              style={{
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: musicOn ? '#e879f9' : 'var(--muted-foreground)',
              }}
              title={musicOn ? 'Musica ON' : 'Musica OFF'}
            >
              {musicOn ? <Music size={14} /> : <VolumeOff size={14} />}
            </motion.button>
          )}

          {/* Dim mode */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setDimMode(!dimMode)}
            className="w-8 h-8 rounded flex items-center justify-center transition-colors"
            style={{
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: dimMode ? '#e879f9' : 'var(--muted-foreground)',
            }}
            aria-label="Modalità notte"
          >
            {dimMode ? <Sun size={14} /> : <Moon size={14} />}
          </motion.button>
        </div>

        {/* Sleep timer banner */}
        <AnimatePresence>
          {sleepOption !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded px-4 py-2 text-center text-xs font-semibold"
              style={{
                backgroundColor: 'rgba(232,121,249,0.1)',
                border: '1px solid rgba(232,121,249,0.2)',
                color: '#e879f9',
              }}
            >
              💤 Spegnimento automatico tra {sleepLabel}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cover */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="relative"
            animate={isPlaying ? { scale: [1, 1.03, 1] } : { scale: 1 }}
            transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
          >
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1.3, opacity: 0.25 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{ background: coverBg }}
                />
              )}
            </AnimatePresence>
            <div
              className="w-44 h-44 rounded-full flex items-center justify-center text-7xl relative z-10"
              style={{ background: coverBg }}
            >
              {coverEmoji}
            </div>
          </motion.div>
        </div>

        {/* Soundwave */}
        <div className="flex justify-center items-end gap-1 h-8 mb-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full ${isPlaying ? 'soundwave-bar' : ''}`}
              style={{
                height: isPlaying ? '100%' : '25%',
                backgroundColor: '#e879f9',
                opacity: isPlaying ? 0.8 : 0.25,
                transition: 'height 0.3s',
              }}
            />
          ))}
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
            {storyTitle}
          </h2>
          {childName && (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Per {childName} con tanto amore 💕</p>
          )}
          {backgroundMusicUrl && musicOn && (
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              🎵 Sottofondo musicale attivo
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-1.5">
          <input
            type="range" min={0} max={duration || 0} value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #e879f9 ${progressPercent}%, var(--surface-2) ${progressPercent}%)`,
              WebkitAppearance: 'none',
            }}
          />
        </div>
        <div className="flex justify-between text-xs mb-8" style={{ color: 'var(--muted-foreground)' }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-5 mb-8">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => skip(-10)}
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            aria-label="Indietro 10 secondi"
          >
            <SkipBack size={18} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.05 }}
            onClick={togglePlay} disabled={isLoading}
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #a855f7, #e879f9)', color: '#ffffff' }}
            aria-label={isPlaying ? 'Pausa' : 'Riproduci'}
          >
            {isLoading
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : isPlaying ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: 2 }} />
            }
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => skip(10)}
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            aria-label="Avanti 10 secondi"
          >
            <SkipForward size={18} />
          </motion.button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            style={{ color: 'var(--muted-foreground)' }}
            aria-label={isMuted ? 'Riattiva audio' : 'Silenzia'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume}
            onChange={handleVolume}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #e879f9 ${(isMuted ? 0 : volume) * 100}%, var(--surface-2) ${(isMuted ? 0 : volume) * 100}%)`,
              WebkitAppearance: 'none',
            }}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  )
}
