'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import type { ChildProfile } from '@/types'

const AVATAR_OPTIONS = ['🧒', '👦', '👧', '🧒‍♀️', '🦁', '🐻', '🦊', '🐸', '🦄', '🐉', '⭐', '🌙']
const THEME_OPTIONS = [
  'Avventura', 'Animali', 'Magia', 'Dinosauri', 'Principesse', 'Supereroi',
  'Spazio', 'Mare', 'Foresta', 'Amicizia', 'Musica', 'Sport',
]

interface ChildFormData {
  name: string
  age: string
  gender: 'male' | 'female' | 'other'
  favorite_themes: string[]
  avatar_emoji: string
}

const emptyForm: ChildFormData = {
  name: '',
  age: '',
  gender: 'other',
  favorite_themes: [],
  avatar_emoji: '🧒',
}

export default function ProfilePage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ChildFormData>(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [familyId, setFamilyId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: family } = await supabase
        .from('families')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (family) {
        setFamilyId(family.id)
        const { data: kids } = await supabase
          .from('child_profiles')
          .select('*')
          .eq('family_id', family.id)
          .order('created_at')
        setProfiles(kids || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!form.name.trim() || !form.age || !familyId) return
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      age: parseInt(form.age),
      gender: form.gender,
      favorite_themes: form.favorite_themes,
      avatar_emoji: form.avatar_emoji,
      family_id: familyId,
    }

    if (editId) {
      const { data, error } = await supabase
        .from('child_profiles')
        .update(payload)
        .eq('id', editId)
        .select()
        .single()
      if (!error && data) {
        setProfiles((prev) => prev.map((p) => (p.id === editId ? data : p)))
      }
    } else {
      const { data, error } = await supabase
        .from('child_profiles')
        .insert(payload)
        .select()
        .single()
      if (!error && data) {
        setProfiles((prev) => [...prev, data])
      }
    }

    setForm(emptyForm)
    setEditId(null)
    setShowForm(false)
    setSaving(false)
  }

  const handleEdit = (profile: ChildProfile) => {
    setForm({
      name: profile.name,
      age: String(profile.age),
      gender: profile.gender,
      favorite_themes: profile.favorite_themes,
      avatar_emoji: profile.avatar_emoji,
    })
    setEditId(profile.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo profilo bambino?')) return
    await supabase.from('child_profiles').delete().eq('id', id)
    setProfiles((prev) => prev.filter((p) => p.id !== id))
  }

  const toggleTheme = (theme: string) => {
    setForm((f) => ({
      ...f,
      favorite_themes: f.favorite_themes.includes(theme)
        ? f.favorite_themes.filter((t) => t !== theme)
        : [...f.favorite_themes, theme],
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <header
        className="border-b px-4 py-3 flex items-center gap-3"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm hover:underline"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <span style={{ color: 'var(--border)' }}>|</span>
        <h1 className="font-bold" style={{ color: 'var(--foreground)' }}>I miei bambini</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Profiles list */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              Profili bambino
            </h2>
            <Button
              size="sm"
              onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true) }}
            >
              <Plus size={14} /> Aggiungi
            </Button>
          </div>

          {profiles.length === 0 && !showForm && (
            <div
              className="rounded-2xl border-2 border-dashed p-10 text-center"
              style={{ borderColor: 'var(--border)' }}
            >
              <p className="text-4xl mb-3">🧒</p>
              <p className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Nessun profilo ancora
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
                Crea il profilo del tuo bambino per personalizzare le storie
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus size={14} /> Crea profilo
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {profiles.map((profile) => (
              <motion.div
                key={profile.id}
                className="rounded-2xl border p-4 flex items-center gap-4"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="text-4xl">{profile.avatar_emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold" style={{ color: 'var(--foreground)' }}>
                    {profile.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    {profile.age} anni
                  </p>
                  {profile.favorite_themes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.favorite_themes.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(profile)}>
                    Modifica
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(profile.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Form */}
        {showForm && (
          <motion.section
            className="rounded-2xl border p-6 space-y-5"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
              {editId ? 'Modifica profilo' : 'Nuovo profilo bambino'}
            </h3>

            {/* Avatar picker */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Avatar
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setForm((f) => ({ ...f, avatar_emoji: emoji }))}
                    className="w-10 h-10 text-xl rounded-full transition-all"
                    style={{
                      backgroundColor: form.avatar_emoji === emoji ? 'var(--primary)' : 'var(--muted)',
                      transform: form.avatar_emoji === emoji ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Nome *
              </label>
              <Input
                placeholder="Nome del bambino"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* Age + gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                  Età *
                </label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  placeholder="4"
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                  Genere
                </label>
                <select
                  className="w-full h-11 rounded-xl border px-3 text-sm"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as 'male' | 'female' | 'other' }))}
                >
                  <option value="other">Non specificato</option>
                  <option value="male">Maschio</option>
                  <option value="female">Femmina</option>
                </select>
              </div>
            </div>

            {/* Themes */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                Temi preferiti
              </label>
              <div className="flex flex-wrap gap-2">
                {THEME_OPTIONS.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => toggleTheme(theme)}
                    className="px-3 py-1.5 rounded-full text-sm border transition-all"
                    style={{
                      borderColor: form.favorite_themes.includes(theme) ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: form.favorite_themes.includes(theme) ? 'var(--primary)' : 'transparent',
                      color: form.favorite_themes.includes(theme) ? 'white' : 'var(--muted-foreground)',
                    }}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.age}
                className="flex-1"
              >
                {saving ? (
                  <><Loader2 size={14} className="animate-spin" /> Salvataggio...</>
                ) : (
                  <><Save size={14} /> Salva profilo</>
                )}
              </Button>
            </div>
          </motion.section>
        )}
      </main>
    </div>
  )
}
