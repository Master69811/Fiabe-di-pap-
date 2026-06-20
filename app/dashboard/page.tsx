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

  // Carica dati famiglia
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

  // Carica cronologia ascolti
  useEffect(() => {
    fetch('/api/sessions')
      .then((r) => r.json())
      .then((data) => { if (data.storyIds) setListenedIds(new Set(data.storyIds)) })
      .catch(() => null)
  }, [])

  // Carica preferiti quando cambia il bambino selezionato
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="text-6xl"
            animate={{ rotate: [0, 10, -10, 0], y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🦉
          </motion.div>
          <p className="font-bold" style={{ color: 'var(--muted-foreground)' }}>Preparo le storie...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

      {/* Mascotte + saluto */}
      <motion.section initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Mascot childName={selectedChild?.name} />
      </motion.section>

      {/* Banner configurazione voce */}
      {family && !family.has_voice_setup && (
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 border-2 flex flex-col sm:flex-row items-center gap-4"
          style={{ backgroundColor: '#fffbeb', borderColor: '#f59e0b', borderStyle: 'dashed' }}
        >
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle size={24} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div>
              <h3 className="font-bold" style={{ color: '#92400e' }}>La tua voce non è ancora configurata</h3>
              <p className="text-sm mt-0.5" style={{ color: '#78350f' }}>
                Registra la tua voce per far sentire ai bambini le storie con il tuo timbro.
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/voice-setup')}
            className="gap-2 flex-shrink-0 rounded-2xl"
            style={{ backgroundColor: '#f59e0b', color: 'white' }}
          >
            <Mic size={16} /> Configura voce
          </Button>
        </motion.div>
      )}

      {/* Profili bambini */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>👶 I tuoi bambini</h2>
          <Button variant="outline" size="sm" onClick={() => router.push('/profile')} className="gap-2 rounded-2xl">
            <Plus size={15} /> Aggiungi
          </Button>
        </div>

        {children.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed p-10 text-center" style={{ borderColor: 'var(--border)' }}>
            <div className="text-5xl mb-3">🧒</div>
            <h3 className="font-bold mb-2" style={{ color: 'var(--foreground)' }}>Nessun profilo bambino</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Aggiungi il profilo del tuo bambino per storie personalizzate
            </p>
            <Button onClick={() => router.push('/profile')} className="gap-2 rounded-2xl">
              <Plus size={16} /> Aggiungi bambino
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Selettore durata */}
      <section>
        <DurationSelector selected={selectedDuration} onChange={setSelectedDuration} />
      </section>

      {/* Catalogo storie */}
      <section>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              📚 Scegli la storia
              {selectedChild && (
                <span className="text-base font-normal ml-2" style={{ color: 'var(--muted-foreground)' }}>
                  per {selectedChild.name}
                </span>
              )}
            </h2>
            {/* Stats ascolti */}
            {listenedIds.size > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                ✓ {listenedIds.size} ascoltate
              </span>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Modalità buonanotte */}
            <Button
              onClick={() => setBedtimeMode(!bedtimeMode)}
              size="sm"
              className="gap-2 rounded-2xl text-sm"
              style={bedtimeMode
                ? { background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)', color: 'white' }
                : { background: 'var(--muted)', color: 'var(--muted-foreground)' }
              }
            >
              {bedtimeMode ? <Sun size={14} /> : <Moon size={14} />}
              {bedtimeMode ? 'Modalità normale' : 'Buonanotte'}
            </Button>

            {/* Crea storia AI */}
            <Button
              onClick={() => router.push('/profile?create-story=1')}
              className="gap-2 rounded-2xl text-sm"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white' }}
              size="sm"
            >
              <Wand2 size={15} /> Crea storia AI
            </Button>
          </div>
        </div>

        {/* Banner modalità buonanotte */}
        {bedtimeMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl p-3 text-sm font-semibold flex items-center gap-2"
            style={{ backgroundColor: '#ede9fe', color: '#4c1d95' }}
          >
            🌙 Modalità buonanotte attiva — mostro solo le storie più rilassanti
          </motion.div>
        )}

        {/* Griglia categorie */}
        <div className="mb-6">
          <CategoryGrid selected={selectedCategory} onChange={setSelectedCategory} />
        </div>

        {/* Filtri: età + preferiti */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>Età:</span>
          <button
            onClick={() => setAgeFilter(null)}
            className="px-3 py-1 rounded-full text-xs font-bold transition-all"
            style={{
              backgroundColor: ageFilter === null ? 'var(--primary)' : 'var(--muted)',
              color: ageFilter === null ? 'white' : 'var(--muted-foreground)',
            }}
          >
            Tutte
          </button>
          {[3, 4, 5, 6, 7, 8, 9, 10].map((age) => (
            <button
              key={age}
              onClick={() => setAgeFilter(age)}
              className="px-3 py-1 rounded-full text-xs font-bold transition-all"
              style={{
                backgroundColor: ageFilter === age ? 'var(--primary)' : 'var(--muted)',
                color: ageFilter === age ? 'white' : 'var(--muted-foreground)',
              }}
            >
              {age}+
            </button>
          ))}

          <div className="flex-1" />

          {/* Filtro preferiti */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all"
            style={{
              backgroundColor: showFavoritesOnly ? '#fee2e2' : 'var(--muted)',
              color: showFavoritesOnly ? '#ef4444' : 'var(--muted-foreground)',
            }}
          >
            <Heart size={11} fill={showFavoritesOnly ? '#ef4444' : 'none'} stroke={showFavoritesOnly ? '#ef4444' : 'currentColor'} />
            Preferite
            {favorites.size > 0 && <span>({favorites.size})</span>}
          </button>
        </div>

        {filteredStories.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--muted-foreground)' }}>
            <div className="text-5xl mb-3">
              {showFavoritesOnly ? '❤️' : '🔍'}
            </div>
            <p className="font-semibold">
              {showFavoritesOnly
                ? 'Nessuna storia nei preferiti.'
                : 'Nessuna storia per questi filtri.'}
            </p>
            <p className="text-sm mt-1">
              {showFavoritesOnly
                ? 'Tocca il cuore ❤️ su una storia per salvarla qui.'
                : 'Prova a cambiare categoria o fascia d\'età.'}
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
          >
            {filteredStories.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
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
