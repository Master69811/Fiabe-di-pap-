'use client'

import { motion } from 'framer-motion'
import { Pencil, BookOpen, Cake, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChildProfile } from '@/types'

interface ChildProfileCardProps {
  profile: ChildProfile
  onListen?: (profile: ChildProfile) => void
  onEdit?: (profile: ChildProfile) => void
  isSelected?: boolean
}

const themeLabels: Record<string, string> = {
  animals: 'Animali',
  adventure: 'Avventura',
  fantasy: 'Fantasia',
  educational: 'Educative',
  sleep: 'Per la notte',
  friendship: 'Amicizia',
  magic: 'Magia',
  space: 'Spazio',
  ocean: 'Oceano',
  forest: 'Foresta',
}

export function ChildProfileCard({
  profile,
  onListen,
  onEdit,
  isSelected = false,
}: ChildProfileCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="rounded-2xl border-2 p-5 flex flex-col gap-4 transition-all duration-200 cursor-pointer"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
        boxShadow: isSelected
          ? '0 0 0 3px rgba(232,131,74,0.2), 0 4px 24px rgba(232,131,74,0.15)'
          : '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-md flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          }}
        >
          {profile.avatar_emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-lg font-bold truncate"
            style={{ color: 'var(--foreground)' }}
          >
            {profile.name}
          </h3>
          <div
            className="flex items-center gap-1.5 text-sm mt-0.5"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <Cake size={13} />
            <span>{profile.age} anni</span>
          </div>
        </div>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            ✓
          </motion.div>
        )}
      </div>

      {/* Favorite themes */}
      {profile.favorite_themes && profile.favorite_themes.length > 0 && (
        <div>
          <div
            className="flex items-center gap-1 text-xs font-semibold mb-2"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <Heart size={11} />
            Temi preferiti
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.favorite_themes.slice(0, 3).map((theme) => (
              <span
                key={theme}
                className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
              >
                {themeLabels[theme] ?? theme}
              </span>
            ))}
            {profile.favorite_themes.length > 3 && (
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
              >
                +{profile.favorite_themes.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Button
          onClick={() => onListen?.(profile)}
          className="flex-1 gap-2"
          size="sm"
        >
          <BookOpen size={14} />
          Ascolta storie
        </Button>
        <Button
          variant="outline"
          onClick={() => onEdit?.(profile)}
          size="sm"
          className="gap-1"
          aria-label="Modifica profilo"
        >
          <Pencil size={14} />
        </Button>
      </div>
    </motion.div>
  )
}
