'use client'

import { motion } from 'framer-motion'

interface MascotProps {
  childName?: string
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Mascot({ childName, message, size = 'md' }: MascotProps) {
  const emojiSize = size === 'sm' ? 'text-3xl' : size === 'lg' ? 'text-6xl' : 'text-4xl'
  const wrapperSize = size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-24 h-24' : 'w-16 h-16'

  const greeting = message ?? (childName
    ? `Ciao ${childName}! Quale storia ascoltiamo stasera?`
    : 'Benvenuto! Scegli una storia e inizia il viaggio.')

  return (
    <div className="flex items-center gap-3">
      <motion.div
        className={`${wrapperSize} rounded-lg flex items-center justify-center flex-shrink-0`}
        style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      >
        <span className={emojiSize}>🦉</span>
      </motion.div>

      <motion.div
        className="relative rounded-lg px-4 py-2.5 flex-1 max-w-sm"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 24 }}
      >
        <div
          className="absolute -left-1.5 top-3.5 w-2.5 h-2.5 rotate-45"
          style={{ backgroundColor: 'var(--surface)', borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
        />
        <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--foreground)' }}>
          {greeting}
        </p>
      </motion.div>
    </div>
  )
}
