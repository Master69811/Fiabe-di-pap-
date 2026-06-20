'use client'

import { motion } from 'framer-motion'
import { Clock, Users, Sparkles, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Story, StoryCategory, StoryMood } from '@/types'

interface StoryCardProps {
  story: Story
  onPlay?: (story: Story) => void
  childName?: string
}

const categoryLabels: Record<StoryCategory, string> = {
  adventure: 'Avventura',
  fantasy: 'Fantasia',
  animals: 'Animali',
  educational: 'Educativa',
  sleep: 'Per la notte',
  friendship: 'Amicizia',
}

const categoryColors: Record<StoryCategory, { bg: string; text: string }> = {
  adventure: { bg: '#fef3c7', text: '#92400e' },
  fantasy: { bg: '#ede9fe', text: '#5b21b6' },
  animals: { bg: '#d1fae5', text: '#065f46' },
  educational: { bg: '#dbeafe', text: '#1e40af' },
  sleep: { bg: '#e0e7ff', text: '#3730a3' },
  friendship: { bg: '#fce7f3', text: '#9d174d' },
}

const moodLabels: Record<StoryMood, string> = {
  exciting: '⚡ Avvincente',
  calm: '🌙 Rilassante',
  funny: '😄 Divertente',
  magical: '✨ Magica',
  cozy: '🤗 Accogliente',
}

export function StoryCard({ story, onPlay, childName }: StoryCardProps) {
  const catColor = categoryColors[story.category]

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card className="overflow-hidden h-full flex flex-col transition-shadow duration-300 hover:shadow-xl">
        {/* Cover art */}
        <div
          className="flex items-center justify-center py-8"
          style={{
            background: 'linear-gradient(135deg, var(--muted) 0%, var(--border) 100%)',
          }}
        >
          <motion.div
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            }}
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            {story.cover_emoji}
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 gap-3">
          {/* Category & Mood badges */}
          <div className="flex flex-wrap gap-2">
            <span
              className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: catColor.bg, color: catColor.text }}
            >
              {categoryLabels[story.category]}
            </span>
            <span
              className="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
            >
              {moodLabels[story.mood]}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold leading-tight" style={{ color: 'var(--foreground)' }}>
            {story.title}
          </h3>

          {/* Description */}
          <p
            className="text-sm leading-relaxed line-clamp-3 flex-1"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {story.description}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {story.duration_minutes} min
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {story.age_min}-{story.age_max} anni
            </span>
            {story.moral && (
              <span className="flex items-center gap-1">
                <Sparkles size={12} />
                <span className="truncate max-w-[120px]" title={story.moral}>
                  Morale
                </span>
              </span>
            )}
          </div>

          {/* Tags */}
          {story.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {story.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA button */}
          <Button
            onClick={() => onPlay?.(story)}
            className="w-full mt-2 gap-2"
            size="default"
          >
            <BookOpen size={16} />
            Ascolta
            {childName ? ` con ${childName}` : ''}
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
