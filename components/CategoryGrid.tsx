'use client'

import { motion } from 'framer-motion'
import { StoryCategory, CATEGORY_META } from '@/types'

interface CategoryGridProps {
  selected: string
  onChange: (category: string) => void
}

const ALL_OPTION = { key: 'all', label: 'Tutte', emoji: '✨', color: '#e879f9' }

export function CategoryGrid({ selected, onChange }: CategoryGridProps) {
  const categories = [
    ALL_OPTION,
    ...Object.entries(CATEGORY_META).map(([key, meta]) => ({ key, ...meta })),
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat, i) => {
        const isActive = selected === cat.key
        return (
          <motion.button
            key={cat.key}
            onClick={() => onChange(cat.key)}
            className="flex items-center gap-1.5 rounded font-semibold text-xs px-3 py-1.5 transition-colors"
            style={{
              backgroundColor: isActive ? cat.color + '22' : 'var(--surface-2)',
              color: isActive ? cat.color : 'var(--muted-foreground)',
              border: `1px solid ${isActive ? cat.color + '66' : 'var(--border)'}`,
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
          >
            <span className="text-sm leading-none">{cat.emoji}</span>
            <span>{cat.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
