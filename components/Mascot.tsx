'use client'

import { motion } from 'framer-motion'

interface MascotProps {
  childName?: string
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Mascot({ childName, message, size = 'md' }: MascotProps) {
  const emojiSize = size === 'sm' ? 'text-4xl' : size === 'lg' ? 'text-8xl' : 'text-6xl'
  const wrapperSize = size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-32 h-32' : 'w-24 h-24'

  const greeting = message ?? (childName
    ? `Ciao ${childName}! Quale storia ascoltiamo stasera? 🌙`
    : 'Benvenuto! Scegli una storia e inizia il viaggio 🌟')

  return (
    <div className="flex items-center gap-4">
      {/* Gufo mascotte */}
      <motion.div
        className={`${wrapperSize} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}
        style={{
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
        }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      >
        <span className={emojiSize}>🦉</span>
      </motion.div>

      {/* Fumetto */}
      <motion.div
        className="relative rounded-2xl px-4 py-3 shadow-sm flex-1 max-w-xs"
        style={{
          backgroundColor: 'var(--surface)',
          border: '2px solid var(--border)',
        }}
        initial={{ opacity: 0, scale: 0.8, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Codina del fumetto */}
        <div
          className="absolute -left-2 top-4 w-3 h-3 rotate-45"
          style={{ backgroundColor: 'var(--surface)', border: '2px solid var(--border)', borderRight: 'none', borderTop: 'none' }}
        />
        <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--foreground)' }}>
          {greeting}
        </p>
      </motion.div>
    </div>
  )
}
