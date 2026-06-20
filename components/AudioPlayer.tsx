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
} from 'lucide-react'

interface AudioPlayerProps {
  audioUrl: string
  storyTitle: string
  childName?: string
  coverEmoji: string
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function AudioPlayer({ audioUrl, storyTitle, childName, coverEmoji }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [nightMode, setNightMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onDurationChange = () => setDuration(audio.duration)
    const onEnded = () => setIsPlaying(false)
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
  }, [])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      await audio.play()
      setIsPlaying(true)
    }
  }, [isPlaying])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const val = Number(e.target.value)
    audio.currentTime = val
    setCurrentTime(val)
  }, [])

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const val = Number(e.target.value)
    audio.volume = val
    setVolume(val)
    setIsMuted(val === 0)
  }, [])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isMuted) {
      audio.volume = volume || 1
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
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

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 transition-all duration-700"
      style={bgStyle}
    >
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      <div className="w-full max-w-md mx-auto">
        {/* Night mode toggle */}
        <div className="flex justify-end mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setNightMode(!nightMode)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{
              backgroundColor: nightMode ? 'rgba(255,255,255,0.1)' : 'var(--muted)',
              color: nightMode ? '#e8d5ff' : 'var(--muted-foreground)',
            }}
            aria-label="Modalità notte"
          >
            {nightMode ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
        </div>

        {/* Cover art */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="relative"
            animate={isPlaying ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
          >
            {/* Outer glow ring */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: 'var(--primary)' }}
                />
              )}
            </AnimatePresence>

            <div
              className="w-48 h-48 rounded-full flex items-center justify-center text-7xl shadow-2xl relative z-10"
              style={{
                background: nightMode
                  ? 'linear-gradient(135deg, #2d1b69 0%, #4c1d95 100%)'
                  : 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
              }}
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
                height: isPlaying ? '100%' : '30%',
                backgroundColor: nightMode ? '#a78bfa' : 'var(--primary)',
                opacity: isPlaying ? 1 : 0.4,
                transition: 'height 0.3s',
              }}
            />
          ))}
        </div>

        {/* Story info */}
        <div className="text-center mb-8">
          <h2
            className="text-2xl font-bold mb-1"
            style={{ color: nightMode ? '#e8d5ff' : 'var(--foreground)' }}
          >
            {storyTitle}
          </h2>
          {childName && (
            <p
              className="text-sm"
              style={{ color: nightMode ? '#c4b5fd' : 'var(--muted-foreground)' }}
            >
              Per {childName} con tanto amore 💕
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--primary) ${progressPercent}%, ${nightMode ? 'rgba(255,255,255,0.15)' : 'var(--border)'} ${progressPercent}%)`,
              WebkitAppearance: 'none',
            }}
          />
        </div>
        <div
          className="flex justify-between text-xs mb-8"
          style={{ color: nightMode ? '#a78bfa' : 'var(--muted-foreground)' }}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => skip(-10)}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: nightMode ? 'rgba(255,255,255,0.1)' : 'var(--muted)',
              color: nightMode ? '#e8d5ff' : 'var(--foreground)',
            }}
            aria-label="Indietro 10 secondi"
          >
            <SkipBack size={20} />
          </motion.button>

          {/* Play/Pause */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={togglePlay}
            disabled={isLoading}
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all"
            style={{
              background: nightMode
                ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                : 'linear-gradient(135deg, var(--primary) 0%, #f4a261 100%)',
              color: '#ffffff',
            }}
            aria-label={isPlaying ? 'Pausa' : 'Riproduci'}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause size={32} />
            ) : (
              <Play size={32} style={{ marginLeft: 3 }} />
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => skip(10)}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: nightMode ? 'rgba(255,255,255,0.1)' : 'var(--muted)',
              color: nightMode ? '#e8d5ff' : 'var(--foreground)',
            }}
            aria-label="Avanti 10 secondi"
          >
            <SkipForward size={20} />
          </motion.button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            style={{ color: nightMode ? '#a78bfa' : 'var(--muted-foreground)' }}
            aria-label={isMuted ? 'Riattiva audio' : 'Silenzia'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${nightMode ? '#7c3aed' : 'var(--primary)'} ${(isMuted ? 0 : volume) * 100}%, ${nightMode ? 'rgba(255,255,255,0.15)' : 'var(--border)'} ${(isMuted ? 0 : volume) * 100}%)`,
              WebkitAppearance: 'none',
            }}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  )
}
