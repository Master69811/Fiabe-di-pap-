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
      <p className="text-sm font-bold" style={{ color: 'var(--muted-foreground)' }}>
        Durata storia
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {DURATION_OPTIONS.map((opt, i) => {
          const isActive = selected === opt.key
          return (
            <motion.button
              key={opt.key}
              onClick={() => onChange(opt.key)}
              className="flex flex-col items-center gap-1 rounded-2xl py-3 px-2 text-center transition-all"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                  : 'var(--muted)',
                color: isActive ? '#fff' : 'var(--muted-foreground)',
                border: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                boxShadow: isActive ? '0 4px 16px rgba(255,140,66,0.35)' : 'none',
              }}
              whileTap={{ scale: 0.93 }}
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className="text-xs font-bold leading-tight">{opt.label}</span>
              <span className="text-xs opacity-75">{opt.minutes}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
