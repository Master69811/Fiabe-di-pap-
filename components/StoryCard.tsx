'use client'

import { motion } from 'framer-motion'
import { Clock, Users } from 'lucide-react'
import { Story, StoryCategory, StoryMood, CATEGORY_META } from '@/types'

interface StoryCardProps {
  story: Story
  onPlay?: (story: Story) => void
  childName?: string
}

const moodLabels: Record<StoryMood, string> = {
  exciting: '⚡ Avvincente',
  calm: '🌙 Rilassante',
  funny: '😄 Divertente',
  magical: '✨ Magica',
  cozy: '🤗 Accogliente',
  tender: '💛 Tenera',
}

const relaxationStars = (level: number) => '★'.repeat(level) + '☆'.repeat(5 - level)

export function StoryCard({ story, onPlay, childName }: StoryCardProps) {
  const meta = CATEGORY_META[story.category as StoryCategory]

  return (
    <motion.div
      className="story-card cursor-pointer h-full"
      whileHover={{ scale: 1.03, y: -6 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      onClick={() => onPlay?.(story)}
    >
      <div
        className="rounded-3xl overflow-hidden h-full flex flex-col shadow-md"
        style={{ backgroundColor: 'var(--surface)', border: '2px solid var(--border)' }}
      >
        {/* Cover con gradiente dalla storia */}
        <div
          className="flex items-center justify-center py-10 relative overflow-hidden"
          style={{ background: story.cover_color }}
        >
          {/* Cerchio luminoso decorativo */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6) 0%, transparent 60%)',
            }}
          />
          <motion.div
            className="text-6xl relative z-10 drop-shadow-lg"
            whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
          >
            {story.cover_emoji}
          </motion.div>

          {/* Livello rilassamento (stelle) in alto a destra */}
          <div className="absolute top-3 right-3 text-xs text-white/80 font-bold tracking-widest">
            {relaxationStars(story.relaxation_level)}
          </div>
        </div>

        {/* Corpo della card */}
        <div className="p-4 flex flex-col flex-1 gap-2">
          {/* Badge categoria */}
          {meta && (
            <div className="flex items-center gap-1">
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: meta.color + '22', color: meta.color }}
              >
                {meta.emoji} {meta.label}
              </span>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full ml-auto"
                style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
              >
                {moodLabels[story.mood]}
              </span>
            </div>
          )}

          {/* Titolo */}
          <h3
            className="text-base font-bold leading-tight"
            style={{ color: 'var(--foreground)' }}
          >
            {story.title}
          </h3>

          {/* Descrizione */}
          <p
            className="text-xs leading-relaxed line-clamp-2 flex-1"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {story.description}
          </p>

          {/* Meta info */}
          <div
            className="flex items-center gap-3 text-xs mt-1"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {story.duration_minutes} min
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} />
              {story.age_min}–{story.age_max} anni
            </span>
          </div>

          {/* Pulsante ascolta */}
          <motion.button
            className="w-full mt-2 py-2.5 rounded-2xl font-bold text-sm text-white shadow-sm transition-opacity"
            style={{ background: story.cover_color }}
            whileHover={{ opacity: 0.9 }}
            whileTap={{ scale: 0.97 }}
          >
            🎧 Ascolta{childName ? ` con ${childName}` : ''}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
