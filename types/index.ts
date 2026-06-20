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

export type Story = {
  id: string
  title: string
  description: string
  content: string
  category: StoryCategory
  age_min: number
  age_max: number
  duration_minutes: number
  language_level: 'simple' | 'medium' | 'rich'
  mood: StoryMood
  is_ai_generated: boolean
  moral?: string
  cover_emoji: string
  tags: string[]
  created_at: string
}

export type StoryCategory =
  | 'adventure'
  | 'fantasy'
  | 'animals'
  | 'educational'
  | 'sleep'
  | 'friendship'

export type StoryMood = 'exciting' | 'calm' | 'funny' | 'magical' | 'cozy'

export type AudioCache = {
  id: string
  story_id: string
  voice_id: string
  child_name?: string
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
