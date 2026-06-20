export type ChildProfile = {
  id: string
  family_id: string
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  favorite_themes: string[]
  avatar_emoji: string
  created_at: string
}

export type StoryCategory =
  | 'magic'        // 🧚 Fiabe magiche
  | 'animals'      // 🐻 Storie con animali
  | 'adventure'    // 🚀 Avventure fantastiche
  | 'sleep'        // 🌙 Storie della buonanotte
  | 'emotions'     // ❤️ Sentimenti ed emozioni
  | 'educational'  // 🌱 Storie educative
  | 'heroes'       // 🦸 Piccoli eroi e coraggio
  | 'family'       // 👨‍👩‍👧 Famiglia e amicizia

export type StoryMood = 'exciting' | 'calm' | 'funny' | 'magical' | 'cozy' | 'tender'

export type StoryDuration = 'quick' | 'classic' | 'adventure' | 'bedtime'

export type Story = {
  id: string
  title: string
  description: string
  content: string
  category: StoryCategory
  age_min: number
  age_max: number
  duration_minutes: number        // durata base del racconto classico
  language_level: 'simple' | 'medium' | 'rich'
  mood: StoryMood
  is_ai_generated: boolean
  moral?: string
  cover_emoji: string
  cover_color: string             // gradiente di sfondo della copertina
  tags: string[]
  relaxation_level: 1 | 2 | 3 | 4 | 5  // 1=movimentato 5=rilassantissimo
  created_at: string
}

export type DurationOption = {
  key: StoryDuration
  label: string
  emoji: string
  minutes: string
  description: string
}

export const DURATION_OPTIONS: DurationOption[] = [
  {
    key: 'quick',
    label: 'Racconto veloce',
    emoji: '⭐',
    minutes: '~5 min',
    description: 'Perfetto per quando c\'è poco tempo',
  },
  {
    key: 'classic',
    label: 'Racconto classico',
    emoji: '🌈',
    minutes: '~10 min',
    description: 'La versione completa della storia',
  },
  {
    key: 'adventure',
    label: 'Grande avventura',
    emoji: '✨',
    minutes: '15–20 min',
    description: 'Con scene extra e più dettagli',
  },
  {
    key: 'bedtime',
    label: 'Nanna lunga',
    emoji: '🌙',
    minutes: '20+ min',
    description: 'Per addormentarsi lentamente',
  },
]

export const CATEGORY_META: Record<StoryCategory, { label: string; emoji: string; color: string; gradient: string }> = {
  magic:       { label: 'Fiabe magiche',     emoji: '🧚', color: '#a855f7', gradient: 'from-purple-400 to-pink-400' },
  animals:     { label: 'Animali',           emoji: '🐻', color: '#f59e0b', gradient: 'from-amber-400 to-orange-400' },
  adventure:   { label: 'Avventure',         emoji: '🚀', color: '#3b82f6', gradient: 'from-blue-400 to-cyan-400' },
  sleep:       { label: 'Buonanotte',        emoji: '🌙', color: '#6366f1', gradient: 'from-indigo-400 to-purple-500' },
  emotions:    { label: 'Emozioni',          emoji: '❤️', color: '#ec4899', gradient: 'from-pink-400 to-rose-400' },
  educational: { label: 'Impariamo',         emoji: '🌱', color: '#22c55e', gradient: 'from-green-400 to-emerald-400' },
  heroes:      { label: 'Piccoli eroi',      emoji: '🦸', color: '#f97316', gradient: 'from-orange-400 to-red-400' },
  family:      { label: 'Famiglia',          emoji: '👨‍👩‍👧', color: '#14b8a6', gradient: 'from-teal-400 to-cyan-400' },
}

export type AudioCache = {
  id: string
  story_id: string
  voice_id: string
  child_name?: string
  duration_key?: StoryDuration
  audio_url: string
  duration_seconds: number
  created_at: string
}

export type VoiceProfile = {
  id: string
  family_id: string
  elevenlabs_voice_id: string
  label: string
  is_active: boolean
  created_at: string
}

export type StorySession = {
  id: string
  family_id: string
  child_profile_id: string
  story_id: string
  completed: boolean
  listened_at: string
}

export type Family = {
  id: string
  user_id: string
  has_voice_setup: boolean
  elevenlabs_voice_id?: string
  created_at: string
}
