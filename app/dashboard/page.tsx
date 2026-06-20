'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Mic, AlertTriangle, Wand2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getStoriesByCategory } from '@/lib/stories-catalog'
import { StoryCard } from '@/components/StoryCard'
import { ChildProfileCard } from '@/components/ChildProfileCard'
import { Mascot } from '@/components/Mascot'
import { CategoryGrid } from '@/components/CategoryGrid'
import { DurationSelector } from '@/components/DurationSelector'
import { Button } from '@/components/ui/button'
import { Family, ChildProfile, Story, StoryDuration } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [family, setFamily] = useState<Family | null>(null)
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDuration, setSelectedDuration] = useState<StoryDuration>('classic')
  const [ageFilter, setAgeFilter] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      let { data: familyData } = await supabase
        .from('families')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!familyData) {
        const { data: created } = await supabase
          .from('families')
          .upsert({ user_id: user.id }, { onConflict: 'user_id' })
          .select('*')
          .single()
        familyData = created
      }

      if (familyData) {
        setFamily(familyData as Family)

        const { data: childrenData } = await supabase
          .from('child_profiles')
          .select('*')
          .eq('family_id', familyData.id)
          .order('created_at', { ascending: true })

        if (childrenData && childrenData.length > 0) {
          setChildren(childrenData as ChildProfile[])
          setSelectedChild(childrenData[0] as ChildProfile)
          if (childrenData[0]?.age) {
            setAgeFilter(childrenData[0].age)
          }
        }
      }

      setLoading(false)
    }

    loadData()
  }, [])

  const filteredStories = (() => {
    let stories = getStoriesByCategory(selectedCategory)
    if (ageFilter !== null) {
      stories = stories.filter((s) => s.age_min <= ageFilter && s.age_max >= ageFilter)
    }
    return stories
  })()

  const handlePlayStory = (story: Story) => {
    const params = new URLSearchParams()
    if (selectedChild) params.set('child', selectedChild.name)
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
          <p className="font-bold" style={{ color: 'var(--muted-foreground)' }}>
            Preparo le storie...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

      {/* Mascotte + saluto */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Mascot childName={selectedChild?.name} />
      </motion.section>

      {/* Banner configurazione voce */}
      {family && !family.has_voice_setup && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 border-2 flex flex-col sm:flex-row items-center gap-4"
          style={{
            backgroundColor: '#fffbeb',
            borderColor: '#f59e0b',
            borderStyle: 'dashed',
          }}
        >
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle size={24} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div>
              <h3 className="font-bold" style={{ color: '#92400e' }}>
                La tua voce non è ancora configurata
              </h3>
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
            <Mic size={16} />
            Configura voce
          </Button>
        </motion.div>
      )}

      {/* Profili bambini */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
            👶 I tuoi bambini
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/profile')}
            className="gap-2 rounded-2xl"
          >
            <Plus size={15} />
            Aggiungi
          </Button>
        </div>

        {children.length === 0 ? (
          <div
            className="rounded-3xl border-2 border-dashed p-10 text-center"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="text-5xl mb-3">🧒</div>
            <h3 className="font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Nessun profilo bambino
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Aggiungi il profilo del tuo bambino per storie personalizzate
            </p>
            <Button onClick={() => router.push('/profile')} className="gap-2 rounded-2xl">
              <Plus size={16} />
              Aggiungi bambino
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
          <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
            📚 Scegli la storia
            {selectedChild && (
              <span className="text-base font-normal ml-2" style={{ color: 'var(--muted-foreground)' }}>
                per {selectedChild.name}
              </span>
            )}
          </h2>
          <Button
            onClick={() => router.push('/profile?create-story=1')}
            className="gap-2 rounded-2xl text-sm"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: 'white' }}
            size="sm"
          >
            <Wand2 size={15} />
            Crea storia AI
          </Button>
        </div>

        {/* Griglia categorie */}
        <div className="mb-6">
          <CategoryGrid selected={selectedCategory} onChange={setSelectedCategory} />
        </div>

        {/* Filtro età */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>
            Età:
          </span>
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
        </div>

        {filteredStories.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--muted-foreground)' }}>
            <div className="text-5xl mb-3">🔍</div>
            <p className="font-semibold">Nessuna storia per questi filtri.</p>
            <p className="text-sm mt-1">Prova a cambiare categoria o fascia d'età.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredStories.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <StoryCard
                  story={story}
                  onPlay={handlePlayStory}
                  childName={selectedChild?.name}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  )
}
