'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/profile/children')
      .then((r) => r.json())
      .then((data) => {
        if (data.error === 'Non autorizzato') {
          router.push('/login')
          return
        }
        setProfiles(data.children ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  const handleSave = async () => {
    if (!form.name.trim() || !form.age) return
    setSaveError(null)
    setSaving(true)

    try {
      const res = await fetch('/api/profile/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, editId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setSaveError(data.error ?? 'Errore nel salvataggio. Riprova.')
        setSaving(false)
        return
      }

      if (editId) {
        setProfiles((prev) => prev.map((p) => (p.id === editId ? data.child : p)))
      } else {
        setProfiles((prev) => [...prev, data.child])
      }

      setForm(emptyForm)
      setEditId(null)
      setShowForm(false)
      try { sessionStorage.removeItem('fiabe_family_v1') } catch {}
    } catch {
      setSaveError('Errore di rete. Controlla la connessione e riprova.')
    }
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
    await fetch(`/api/profile/children?id=${id}`, { method: 'DELETE' })
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #f3e8ff 0%, #fdf4ff 100%)' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: '#7c3aed' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f3e8ff 0%, #fdf4ff 100%)' }}>
      <header
        className="border-b px-4 py-3 flex items-center gap-3"
        style={{ borderColor: '#e9d5ff', backgroundColor: 'rgba(253,244,255,0.95)' }}
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
          style={{ color: '#7c3aed' }}
        >
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <span style={{ color: '#e9d5ff' }}>|</span>
        <h1 className="font-bold" style={{ color: '#4c1d95' }}>I miei bambini 👶</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Lista profili */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: '#4c1d95' }}>
              Profili bambino
            </h2>
            <Button
              size="sm"
              onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); setSaveError(null) }}
              style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)', color: 'white' }}
            >
              <Plus size={14} /> Aggiungi
            </Button>
          </div>

          {profiles.length === 0 && !showForm && (
            <div
              className="rounded-2xl border-2 border-dashed p-10 text-center"
              style={{ borderColor: '#e9d5ff' }}
            >
              <p className="text-4xl mb-3">🧒</p>
              <p className="font-medium mb-1" style={{ color: '#4c1d95' }}>
                Nessun profilo ancora
              </p>
              <p className="text-sm mb-4" style={{ color: '#7c3aed' }}>
                Crea il profilo del tuo bambino per personalizzare le storie
              </p>
              <Button
                onClick={() => setShowForm(true)}
                style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)', color: 'white' }}
              >
                <Plus size={14} /> Crea profilo
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {profiles.map((profile) => (
              <motion.div
                key={profile.id}
                className="rounded-2xl border p-4 flex items-center gap-4"
                style={{ borderColor: '#e9d5ff', backgroundColor: 'white' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="text-4xl">{profile.avatar_emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold" style={{ color: '#4c1d95' }}>
                    {profile.name}
                  </h3>
                  <p className="text-sm" style={{ color: '#7c3aed' }}>
                    {profile.age} anni
                  </p>
                  {profile.favorite_themes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.favorite_themes.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(profile)}
                    style={{ color: '#7c3aed' }}
                  >
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
            style={{ borderColor: '#e9d5ff', backgroundColor: 'white' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-bold text-lg" style={{ color: '#4c1d95' }}>
              {editId ? 'Modifica profilo' : 'Nuovo profilo bambino'}
            </h3>

            {/* Avatar picker */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#4c1d95' }}>
                Avatar
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setForm((f) => ({ ...f, avatar_emoji: emoji }))}
                    className="w-10 h-10 text-xl rounded-full transition-all"
                    style={{
                      backgroundColor: form.avatar_emoji === emoji ? '#7c3aed' : '#f3e8ff',
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
              <label className="block text-sm font-medium mb-1" style={{ color: '#4c1d95' }}>
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
                <label className="block text-sm font-medium mb-1" style={{ color: '#4c1d95' }}>
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
                <label className="block text-sm font-medium mb-1" style={{ color: '#4c1d95' }}>
                  Genere
                </label>
                <select
                  className="w-full h-11 rounded-xl border px-3 text-sm"
                  style={{ borderColor: '#e9d5ff', backgroundColor: 'white', color: '#4c1d95' }}
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
              <label className="block text-sm font-medium mb-2" style={{ color: '#4c1d95' }}>
                Temi preferiti
              </label>
              <div className="flex flex-wrap gap-2">
                {THEME_OPTIONS.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => toggleTheme(theme)}
                    className="px-3 py-1.5 rounded-full text-sm border transition-all"
                    style={{
                      borderColor: form.favorite_themes.includes(theme) ? '#7c3aed' : '#e9d5ff',
                      backgroundColor: form.favorite_themes.includes(theme) ? '#7c3aed' : 'transparent',
                      color: form.favorite_themes.includes(theme) ? 'white' : '#7c3aed',
                    }}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {saveError && (
              <div className="rounded-xl p-3 text-sm text-red-700" style={{ backgroundColor: '#fee2e2' }}>
                {saveError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); setSaveError(null) }}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.age}
                className="flex-1"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)', color: 'white' }}
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
