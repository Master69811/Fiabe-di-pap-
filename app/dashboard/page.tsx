'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Mic, AlertTriangle, Wand2, Moon, Sun, Heart } from 'lucide-react'
import { getStoriesByCategory } from '@/lib/stories-catalog'
import { StoryCard } from '@/components/StoryCard'
import { ChildProfileCard } from '@/components/ChildProfileCard'
import { Mascot } from '@/components/Mascot'
import { CategoryGrid } from '@/components/CategoryGrid'
import { DurationSelector } from '@/components/DurationSelector'
import { Button } from '@/components/ui/button'
import { Family, ChildProfile, Story, StoryDuration } from '@/types'

const FAVORITES_KEY = 'fiabe_favorites_v1'

function loadFavorites(childId: string | null): Set<string> {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    if (!stored) return new Set()
    const data = JSON.parse(stored) as Record<string, string[]>
    return new Set(data[childId ?? '__all__'] ?? [])
  } catch { return new Set() }
}

function saveFavorites(childId: string | null, favs: Set<string>) {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    const data: Record<string, string[]> = stored ? JSON.parse(stored) : {}
    data[childId ?? '__all__'] = [...favs]
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(data))
  } catch {}
}

export default function DashboardPage() {
  const router = useRouter()

  const [family, setFamily] = useState<Family | null>(null)
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDuration, setSelectedDuration] = useState<StoryDuration>('classic')
  const [ageFilter, setAgeFilter] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [bedtimeMode, setBedtimeMode] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [listenedIds, setListenedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function loadData() {
      try {
        const cached = sessionStorage.getItem('fiabe_family_v1')
        if (cached) {
          const { family: f, children: c, ts } = JSON.parse(cached)
          if (Date.now() - ts < 5 * 60 * 1000) {
            if (f) setFamily(f as Family)
            if (c?.length > 0) {
              setChildren(c as ChildProfile[])
              setSelectedChild(c[0] as ChildProfile)
              if (c[0]?.age) setAgeFilter(c[0].age)
            }
            setLoading(false)
            return
          }
        }
      } catch {}

      try {
        const res = await fetch('/api/family/ensure')
        if (res.status === 401) { router.push('/login'); return }
        if (res.ok) {
          const data = await res.json()
          if (data.family) setFamily(data.family as Family)
          if (data.children?.length > 0) {
            setChildren(data.children as ChildProfile[])
            setSelectedChild(data.children[0] as ChildProfile)
            if (data.children[0]?.age) setAgeFilter(data.children[0].age)
          }
          try {
            sessionStorage.setItem('fiabe_family_v1', JSON.stringify({
              family: data.family, children: data.children ?? [], ts: Date.now()
            }))
          } catch {}
        }
      } catch {}
      setLoading(false)
    }
    loadData()
  }, [router])

  useEffect(() => {
    fetch('/api/sessions')
      .then((r) => r.json())
      .then((data) => { if (data.storyIds) setListenedIds(new Set(data.storyIds)) })
      .catch(() => null)
  }, [])

  useEffect(() => {
    setFavorites(loadFavorites(selectedChild?.id ?? null))
  }, [selectedChild])

  const handleToggleFavorite = useCallback((storyId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(storyId)) next.delete(storyId); else next.add(storyId)
      saveFavorites(selectedChild?.id ?? null, next)
      return next
    })
  }, [selectedChild])

  const filteredStories = (() => {
    let stories = getStoriesByCategory(selectedCategory)
    if (ageFilter !== null) {
      stories = stories.filter((s) => s.age_min <= ageFilter && s.age_max >= ageFilter)
    }
    if (bedtimeMode) {
      stories = stories.filter((s) => s.relaxation_level >= 4)
    }
    if (showFavoritesOnly) {
      stories = stories.filter((s) => favorites.has(s.id))
    }
    return stories
  })()

  const handlePlayStory = (story: Story) => {
    const params = new URLSearchParams()
    if (selectedChild) {
      params.set('child', selectedChild.name)
      params.set('childId', selectedChild.id)
    }
    if (family?.elevenlabs_voice_id) params.set('voiceId', family.elevenlabs_voice_id)
    params.set('duration', selectedDuration)
    router.push(`/play/${story.id}?${params.toString()}`)
  }

  const handleChildListen = (child: ChildProfile) => {
    setSelectedChild(child)
    setAgeFilter(child.age)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ backgroundColor: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-3">
          <motion.div
            className="text-5xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🦉
          </motion.div>
          <p className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>Preparo le storie...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

      {/* Header row: mascot + stats */}
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <Mascot childName={selectedChild?.name} />
        {listenedIds.size > 0 && (
          <span
            className="text-xs px-3 py-1.5 rounded font-semibold flex-shrink-0"
            style={{ backgroundColor: 'var(--surface-2)', color: 'var(--violet)', border: '1px solid var(--border)' }}
          >
            ✓ {listenedIds.size} {listenedIds.size === 1 ? 'storia ascoltata' : 'storie ascoltate'}
          </span>
        )}
      </motion.section>

      {/* Voice setup banner */}
      {family && !family.has_voice_setup && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-lg p-4 flex flex-col sm:flex-row items-center gap-3"
          style={{ backgroundColor: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}
        >
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle size={18} style={{ color: '#fbbf24', flexShrink: 0 }} />
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>La tua voce non è ancora configurata</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                Registra la tua voce per far sentire ai bambini le storie con il tuo timbro.
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/voice-setup')}
            size="sm"
            className="gap-1.5 flex-shrink-0"
            style={{ backgroundColor: '#fbbf24', color: '#0a0710' }}
          >
            <Mic size={14} /> Configura voce
          </Button>
        </motion.div>
      )}

      {/* Children profiles */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
            I tuoi bambini
          </h2>
          <Button variant="outline" size="sm" onClick={() => router.push('/profile')} className="gap-1.5 h-7 text-xs">
            <Plus size={12} /> Aggiungi
          </Button>
        </div>

        {children.length === 0 ? (
          <div
            className="rounded-lg border p-10 text-center"
            style={{ borderColor: 'var(--border)', borderStyle: 'dashed', backgroundColor: 'var(--surface)' }}
          >
            <div className="text-4xl mb-3">🧒</div>
            <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>Nessun profilo bambino</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Aggiungi il profilo del tuo bambino per storie personalizzate
            </p>
            <Button onClick={() => router.push('/profile')} size="sm" className="gap-1.5">
              <Plus size={13} /> Aggiungi bambino
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {children.map((child) => (
              <ChildProfileCard
                key={child.id}
                profile={child}
                isSelected={selectedChild?.id === child.id}
                onListen={handleChildListen}
                onEdit={() => router.push('/profile')}
              />
            ))}
          </div>
        )}
      </section>

      {/* Duration selector */}
      <section>
        <DurationSelector selected={selectedDuration} onChange={setSelectedDuration} />
      </section>

      {/* Story catalog */}
      <section>
        {/* Section header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
              Catalogo
            </h2>
            {selectedChild && (
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                per {selectedChild.name}
              </span>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Bedtime mode */}
            <button
              onClick={() => setBedtimeMode(!bedtimeMode)}
              className="flex items-center gap-1.5 h-7 px-3 rounded text-xs font-semibold transition-colors"
              style={bedtimeMode
                ? { backgroundColor: 'rgba(167,139,250,0.15)', color: 'var(--violet)', border: '1px solid rgba(167,139,250,0.3)' }
                : { backgroundColor: 'var(--surface-2)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }
              }
            >
              {bedtimeMode ? <Sun size={12} /> : <Moon size={12} />}
              {bedtimeMode ? 'Normale' : 'Buonanotte'}
            </button>

            {/* AI create */}
            <button
              onClick={() => router.push('/profile?create-story=1')}
              className="flex items-center gap-1.5 h-7 px-3 rounded text-xs font-semibold"
              style={{ background: 'linear-gradient(135deg, #a855f7, #e879f9)', color: 'white' }}
            >
              <Wand2 size={12} /> Crea storia AI
            </button>
          </div>
        </div>

        {/* Bedtime banner */}
        {bedtimeMode && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded px-4 py-2 text-xs font-semibold flex items-center gap-2"
            style={{ backgroundColor: 'rgba(167,139,250,0.1)', color: 'var(--violet)', border: '1px solid rgba(167,139,250,0.2)' }}
          >
            🌙 Modalità buonanotte — mostro solo le storie più rilassanti
          </motion.div>
        )}

        {/* Category tabs */}
        <div className="mb-4">
          <CategoryGrid selected={selectedCategory} onChange={setSelectedCategory} />
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Età:</span>
          <button
            onClick={() => setAgeFilter(null)}
            className="px-2.5 py-1 rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: ageFilter === null ? 'var(--primary)' : 'var(--surface-2)',
              color: ageFilter === null ? '#fff' : 'var(--muted-foreground)',
              border: `1px solid ${ageFilter === null ? 'var(--primary)' : 'var(--border)'}`,
            }}
          >
            Tutte
          </button>
          {[3, 4, 5, 6, 7, 8, 9, 10].map((age) => (
            <button
              key={age}
              onClick={() => setAgeFilter(age)}
              className="px-2.5 py-1 rounded text-xs font-semibold transition-colors"
              style={{
                backgroundColor: ageFilter === age ? 'var(--primary)' : 'var(--surface-2)',
                color: ageFilter === age ? '#fff' : 'var(--muted-foreground)',
                border: `1px solid ${ageFilter === age ? 'var(--primary)' : 'var(--border)'}`,
              }}
            >
              {age}+
            </button>
          ))}

          <div className="flex-1" />

          {/* Favorites filter */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: showFavoritesOnly ? 'rgba(251,113,133,0.15)' : 'var(--surface-2)',
              color: showFavoritesOnly ? '#fb7185' : 'var(--muted-foreground)',
              border: `1px solid ${showFavoritesOnly ? 'rgba(251,113,133,0.3)' : 'var(--border)'}`,
            }}
          >
            <Heart size={10} fill={showFavoritesOnly ? '#fb7185' : 'none'} stroke={showFavoritesOnly ? '#fb7185' : 'currentColor'} />
            Preferite
            {favorites.size > 0 && <span>({favorites.size})</span>}
          </button>
        </div>

        {/* Story grid */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--muted-foreground)' }}>
            <div className="text-4xl mb-3">{showFavoritesOnly ? '❤️' : '🔍'}</div>
            <p className="text-sm font-semibold">
              {showFavoritesOnly ? 'Nessuna storia nei preferiti.' : 'Nessuna storia per questi filtri.'}
            </p>
            <p className="text-xs mt-1">
              {showFavoritesOnly
                ? 'Tocca il cuore su una storia per salvarla qui.'
                : "Prova a cambiare categoria o fascia d'età."}
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
          >
            {filteredStories.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
              >
                <StoryCard
                  story={story}
                  onPlay={handlePlayStory}
                  childName={selectedChild?.name}
                  isFavorite={favorites.has(story.id)}
                  onToggleFavorite={handleToggleFavorite}
                  isListened={listenedIds.has(story.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  )
}
