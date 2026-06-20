-- ============================================
-- Fiabe di Papà — Database Schema
-- Esegui su Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FAMILIES
-- Una per utente, contiene il voice ID
-- ============================================
CREATE TABLE IF NOT EXISTS families (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  has_voice_setup BOOLEAN DEFAULT FALSE NOT NULL,
  elevenlabs_voice_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- CHILD PROFILES
-- Profili dei bambini della famiglia
-- ============================================
CREATE TABLE IF NOT EXISTS child_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 1 AND age <= 12),
  gender TEXT DEFAULT 'other' CHECK (gender IN ('male', 'female', 'other')),
  favorite_themes TEXT[] DEFAULT '{}',
  avatar_emoji TEXT DEFAULT '🧒',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- STORY SESSIONS
-- Storico ascolti per famiglia
-- ============================================
CREATE TABLE IF NOT EXISTS story_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE SET NULL,
  story_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  listened_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- AUDIO CACHE
-- Evita di rigenerare lo stesso audio
-- Cache key: story_id + voice_id + child_name
-- ============================================
CREATE TABLE IF NOT EXISTS audio_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  child_name TEXT NOT NULL DEFAULT '__no_name__',
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (story_id, voice_id, child_name)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

-- Families: ogni utente vede solo la propria
CREATE POLICY "families_own" ON families
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Child profiles: visibili solo alla propria famiglia
CREATE POLICY "child_profiles_own" ON child_profiles
  FOR ALL
  USING (
    family_id IN (SELECT id FROM families WHERE user_id = auth.uid())
  )
  WITH CHECK (
    family_id IN (SELECT id FROM families WHERE user_id = auth.uid())
  );

-- Story sessions: visibili solo alla propria famiglia
CREATE POLICY "story_sessions_own" ON story_sessions
  FOR ALL
  USING (
    family_id IN (SELECT id FROM families WHERE user_id = auth.uid())
  )
  WITH CHECK (
    family_id IN (SELECT id FROM families WHERE user_id = auth.uid())
  );

-- Audio cache: leggibile da tutti gli utenti autenticati (è un cache condiviso)
-- ma solo gli utenti autenticati possono inserire
CREATE POLICY "audio_cache_select" ON audio_cache
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "audio_cache_insert" ON audio_cache
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- TRIGGER: auto-create family on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.families (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- TRIGGER: updated_at on families
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS families_updated_at ON families;
CREATE TRIGGER families_updated_at
  BEFORE UPDATE ON families
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================
-- STORAGE BUCKET per audio
-- Esegui separatamente dalla dashboard Supabase
-- oppure via API:
-- ============================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('audio-stories', 'audio-stories', true)
-- ON CONFLICT DO NOTHING;

-- Storage policy (esegui dopo aver creato il bucket):
-- CREATE POLICY "audio_public_read" ON storage.objects
--   FOR SELECT USING (bucket_id = 'audio-stories');
-- CREATE POLICY "audio_authenticated_insert" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'audio-stories' AND auth.role() = 'authenticated'
--   );
