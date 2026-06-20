'use client'

import { motion } from 'framer-motion'
import { StoryCategory, CATEGORY_META } from '@/types'

interface CategoryGridProps {
  selected: string
  onChange: (category: string) => void
}

const ALL_OPTION = { key: 'all', label: 'Tutte', emoji: '✨', color: '#FF8C42', gradient: 'from-orange-400 to-amber-400' }

export function CategoryGrid({ selected, onChange }: CategoryGridProps) {
  const categories = [
    ALL_OPTION,
    ...Object.entries(CATEGORY_META).map(([key, meta]) => ({ key, ...meta })),
  ]

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
      {categories.map((cat, i) => {
        const isActive = selected === cat.key
        return (
          <motion.button
            key={cat.key}
            onClick={() => onChange(cat.key)}
            className="flex flex-col items-center gap-1.5 rounded-2xl py-3 px-2 transition-all font-bold text-xs"
            style={{
              background: isActive ? cat.color : 'var(--muted)',
              color: isActive ? '#fff' : 'var(--muted-foreground)',
              border: isActive ? `2px solid ${cat.color}` : '2px solid transparent',
              boxShadow: isActive ? `0 4px 16px ${cat.color}44` : 'none',
            }}
            whileTap={{ scale: 0.93 }}
            whileHover={{ y: -2 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
          >
            <span className="text-xl leading-none">{cat.emoji}</span>
            <span className="leading-tight text-center">{cat.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
