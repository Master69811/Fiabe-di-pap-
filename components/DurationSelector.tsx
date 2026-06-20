'use client'

import { motion } from 'framer-motion'
import { DURATION_OPTIONS, StoryDuration } from '@/types'

interface DurationSelectorProps {
  selected: StoryDuration
  onChange: (duration: StoryDuration) => void
}

export function DurationSelector({ selected, onChange }: DurationSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
        Durata storia
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {DURATION_OPTIONS.map((opt, i) => {
          const isActive = selected === opt.key
          return (
            <motion.button
              key={opt.key}
              onClick={() => onChange(opt.key)}
              className="flex flex-col items-center gap-1 rounded-lg py-3 px-2 text-center"
              style={{
                backgroundColor: isActive ? 'var(--accent-dim)' : 'var(--surface)',
                color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className="text-lg">{opt.emoji}</span>
              <span className="text-xs font-bold leading-tight">{opt.label}</span>
              <span className="text-xs opacity-60">{opt.minutes}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
