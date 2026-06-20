'use client'

import { motion } from 'framer-motion'
import { Clock, Users, Heart } from 'lucide-react'
import { Story, StoryCategory, StoryMood, CATEGORY_META } from '@/types'

interface StoryCardProps {
  story: Story
  onPlay?: (story: Story) => void
  childName?: string
  isFavorite?: boolean
  onToggleFavorite?: (storyId: string) => void
  isListened?: boolean
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

export function StoryCard({ story, onPlay, childName, isFavorite, onToggleFavorite, isListened }: StoryCardProps) {
  const meta = CATEGORY_META[story.category as StoryCategory]

  return (
    <motion.div
      className="story-card cursor-pointer h-full"
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
      onClick={() => onPlay?.(story)}
    >
      <div
        className="rounded-lg overflow-hidden h-full flex flex-col"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Cover */}
        <div
          className="flex items-center justify-center py-8 relative overflow-hidden"
          style={{ background: story.cover_color }}
        >
          <div
            className="absolute inset-0 opacity-15"
            style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6) 0%, transparent 60%)' }}
          />

          <motion.div
            className="text-5xl relative z-10 drop-shadow-lg"
            whileHover={{ rotate: [0, -6, 6, 0], transition: { duration: 0.4 } }}
          >
            {story.cover_emoji}
          </motion.div>

          {/* Relaxation stars */}
          <div className="absolute top-2 right-2 text-xs text-white/70 font-bold tracking-widest">
            {relaxationStars(story.relaxation_level)}
          </div>

          {/* Already listened badge */}
          {isListened && (
            <div
              className="absolute top-2 left-2 w-5 h-5 rounded flex items-center justify-center text-xs font-black"
              style={{ backgroundColor: '#22c55e', color: 'white' }}
              title="Già ascoltata"
            >
              ✓
            </div>
          )}

          {/* Favorite button */}
          {onToggleFavorite && (
            <motion.button
              whileTap={{ scale: 0.82 }}
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(story.id) }}
              className="absolute bottom-2 right-2 w-7 h-7 rounded flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
              aria-label={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
            >
              <Heart
                size={14}
                fill={isFavorite ? '#fb7185' : 'none'}
                stroke={isFavorite ? '#fb7185' : 'rgba(255,255,255,0.7)'}
              />
            </motion.button>
          )}
        </div>

        {/* Body */}
        <div className="p-3 flex flex-col flex-1 gap-2">
          {/* Badges */}
          {meta && (
            <div className="flex items-center gap-1 flex-wrap">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ backgroundColor: meta.color + '22', color: meta.color }}
              >
                {meta.emoji} {meta.label}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded ml-auto"
                style={{ backgroundColor: 'var(--surface-2)', color: 'var(--muted-foreground)' }}
              >
                {moodLabels[story.mood]}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-sm font-bold leading-tight" style={{ color: 'var(--foreground)' }}>
            {story.title}
            {story.tags.includes('fiaba classica') && (
              <span className="ml-1 text-xs font-normal" style={{ color: 'var(--violet)' }}>classica</span>
            )}
          </h3>

          {/* Description */}
          <p className="text-xs leading-relaxed line-clamp-2 flex-1" style={{ color: 'var(--muted-foreground)' }}>
            {story.description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {story.duration_minutes} min
            </span>
            <span className="flex items-center gap-1">
              <Users size={10} />
              {story.age_min}–{story.age_max} anni
            </span>
          </div>

          {/* CTA */}
          <motion.button
            className="w-full mt-1 py-2 rounded font-bold text-xs text-white"
            style={{ backgroundColor: 'var(--primary)' }}
            whileHover={{ opacity: 0.88 }}
            whileTap={{ scale: 0.97 }}
          >
            🎧 Ascolta{childName ? ` con ${childName}` : ''}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
