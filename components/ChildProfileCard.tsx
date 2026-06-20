'use client'

import { motion } from 'framer-motion'
import { Pencil, BookOpen, Cake, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 340, damping: 24 }}
      className="rounded-lg p-4 flex flex-col gap-3 cursor-pointer"
      style={{
        backgroundColor: 'var(--surface)',
        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
      }}
    >
      {/* Avatar + info */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' }}
        >
          {profile.avatar_emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>
            {profile.name}
          </h3>
          <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            <Cake size={11} />
            <span>{profile.age} anni</span>
          </div>
        </div>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-black"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            ✓
          </motion.div>
        )}
      </div>

      {/* Favorite themes */}
      {profile.favorite_themes && profile.favorite_themes.length > 0 && (
        <div>
          <div className="flex items-center gap-1 text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
            <Heart size={10} />
            <span className="font-semibold">Temi preferiti</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {profile.favorite_themes.slice(0, 3).map((theme) => (
              <span
                key={theme}
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{ backgroundColor: 'var(--surface-2)', color: 'var(--muted-foreground)' }}
              >
                {themeLabels[theme] ?? theme}
              </span>
            ))}
            {profile.favorite_themes.length > 3 && (
              <span
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{ backgroundColor: 'var(--surface-2)', color: 'var(--muted-foreground)' }}
              >
                +{profile.favorite_themes.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Button onClick={() => onListen?.(profile)} className="flex-1 gap-1.5 text-xs h-8" size="sm">
          <BookOpen size={13} />
          Ascolta storie
        </Button>
        <Button
          variant="outline"
          onClick={() => onEdit?.(profile)}
          size="sm"
          className="gap-1 h-8 w-8 px-0"
          aria-label="Modifica profilo"
        >
          <Pencil size={13} />
        </Button>
      </div>
    </motion.div>
  )
}
