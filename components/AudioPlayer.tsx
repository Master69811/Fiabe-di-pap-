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
  const [nightMode, setNightMode] = useState(false)
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

  // Sleep timer countdown
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

  const bgStyle: React.CSSProperties = nightMode
    ? { background: 'linear-gradient(135deg, #0d0a1a 0%, #1a1230 100%)', color: '#e8d5ff' }
    : { background: 'linear-gradient(135deg, #fdf8f0 0%, #f5ede0 100%)', color: 'var(--foreground)' }

  const accentColor = nightMode ? '#a78bfa' : '#7c3aed'
  const coverBg = nightMode
    ? 'linear-gradient(135deg, #2d1b69 0%, #4c1d95 100%)'
    : (coverColor ?? 'linear-gradient(135deg, #7c3aed 0%, #f4a261 100%)')

  const sleepLabel = sleepOption === null
    ? null
    : sleepDisplay > 0
      ? formatTime(sleepDisplay)
      : `${sleepOption}m`

  return (
    <div className="min-h-screen flex items-center justify-center p-6 transition-all duration-700" style={bgStyle}>
      <audio ref={audioRef} src={audioUrl} preload="auto" />
      {backgroundMusicUrl && <audio ref={musicRef} src={backgroundMusicUrl} loop preload="none" />}

      <div className="w-full max-w-md mx-auto">
        {/* Barra pulsanti in alto */}
        <div className="flex justify-end gap-2 mb-6">
          {/* Sleep timer */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={cycleSleep}
            className="h-10 rounded-full flex items-center justify-center gap-1.5 transition-colors px-3"
            style={{
              backgroundColor: sleepOption !== null
                ? (nightMode ? 'rgba(167,139,250,0.2)' : '#ede9fe')
                : (nightMode ? 'rgba(255,255,255,0.1)' : '#f3e8ff'),
              color: sleepOption !== null ? accentColor : (nightMode ? '#6b7280' : '#9ca3af'),
              minWidth: '2.5rem',
            }}
            title={sleepOption === null ? 'Timer spegnimento' : `Spegni tra ${sleepLabel}`}
          >
            <Clock size={15} />
            {sleepLabel && <span className="text-xs font-bold tabular-nums">{sleepLabel}</span>}
          </motion.button>

          {/* Musica */}
          {backgroundMusicUrl && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleMusic}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{
                backgroundColor: nightMode ? 'rgba(255,255,255,0.1)' : '#f3e8ff',
                color: musicOn ? accentColor : (nightMode ? '#6b7280' : '#9ca3af'),
              }}
              title={musicOn ? 'Musica ON' : 'Musica OFF'}
            >
              {musicOn ? <Music size={16} /> : <VolumeOff size={16} />}
            </motion.button>
          )}

          {/* Notte */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setNightMode(!nightMode)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{
              backgroundColor: nightMode ? 'rgba(255,255,255,0.1)' : '#f3e8ff',
              color: nightMode ? '#e8d5ff' : '#7c3aed',
            }}
            aria-label="Modalità notte"
          >
            {nightMode ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
        </div>

        {/* Sleep timer banner */}
        <AnimatePresence>
          {sleepOption !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded-xl px-4 py-2 text-center text-sm font-semibold"
              style={{
                backgroundColor: nightMode ? 'rgba(167,139,250,0.15)' : '#ede9fe',
                color: accentColor,
              }}
            >
              💤 Spegnimento automatico tra {sleepLabel}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Copertina */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="relative"
            animate={isPlaying ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={{ duration: 2.5, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
          >
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1.25, opacity: 0.35 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse' }}
                  className="absolute inset-0 rounded-full blur-md"
                  style={{ background: coverBg }}
                />
              )}
            </AnimatePresence>
            <div
              className="w-48 h-48 rounded-full flex items-center justify-center text-7xl shadow-2xl relative z-10"
              style={{ background: coverBg }}
            >
              {coverEmoji}
            </div>
          </motion.div>
        </div>

        {/* Soundwave */}
        <div className="flex justify-center items-end gap-1 h-10 mb-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full ${isPlaying ? 'soundwave-bar' : ''}`}
              style={{
                height: isPlaying ? '100%' : '28%',
                backgroundColor: accentColor,
                opacity: isPlaying ? 1 : 0.35,
                transition: 'height 0.3s',
              }}
            />
          ))}
        </div>

        {/* Titolo */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-1" style={{ color: nightMode ? '#e8d5ff' : '#4c1d95' }}>
            {storyTitle}
          </h2>
          {childName && (
            <p style={{ color: nightMode ? '#c4b5fd' : '#7c3aed' }}>Per {childName} con tanto amore 💕</p>
          )}
          {backgroundMusicUrl && musicOn && (
            <p className="text-xs mt-1" style={{ color: nightMode ? '#7c3aed' : '#a78bfa' }}>
              🎵 Sottofondo musicale attivo
            </p>
          )}
        </div>

        {/* Barra progresso */}
        <div className="mb-2">
          <input
            type="range" min={0} max={duration || 0} value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${accentColor} ${progressPercent}%, ${nightMode ? 'rgba(255,255,255,0.15)' : '#e9d5ff'} ${progressPercent}%)`,
              WebkitAppearance: 'none',
            }}
          />
        </div>
        <div className="flex justify-between text-xs mb-8" style={{ color: nightMode ? '#a78bfa' : '#7c3aed' }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controlli */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => skip(-10)}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: nightMode ? 'rgba(255,255,255,0.1)' : '#f3e8ff', color: nightMode ? '#e8d5ff' : '#7c3aed' }}
            aria-label="Indietro 10 secondi"
          >
            <SkipBack size={20} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.06 }}
            onClick={togglePlay} disabled={isLoading}
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
            style={{ background: nightMode ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' : coverBg, color: '#ffffff' }}
            aria-label={isPlaying ? 'Pausa' : 'Riproduci'}
          >
            {isLoading
              ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : isPlaying ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: 3 }} />
            }
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => skip(10)}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: nightMode ? 'rgba(255,255,255,0.1)' : '#f3e8ff', color: nightMode ? '#e8d5ff' : '#7c3aed' }}
            aria-label="Avanti 10 secondi"
          >
            <SkipForward size={20} />
          </motion.button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <button onClick={toggleMute} style={{ color: nightMode ? '#a78bfa' : '#7c3aed' }} aria-label={isMuted ? 'Riattiva audio' : 'Silenzia'}>
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range" min={0} max={1} step={0.05} value={isMuted ? 0 : volume}
            onChange={handleVolume}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${accentColor} ${(isMuted ? 0 : volume) * 100}%, ${nightMode ? 'rgba(255,255,255,0.15)' : '#e9d5ff'} ${(isMuted ? 0 : volume) * 100}%)`,
              WebkitAppearance: 'none',
            }}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  )
}
