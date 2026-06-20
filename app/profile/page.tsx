'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Trash2, Save, Loader2, Pencil, X } from 'lucide-react'
import type { ChildProfile } from '@/types'

const MAX_PROFILES = 5
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
        if (data.error === 'Non autorizzato') { router.push('/login'); return }
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
      if (!res.ok) { setSaveError(data.error ?? 'Errore nel salvataggio.'); setSaving(false); return }
      if (editId) {
        setProfiles((prev) => prev.map((p) => (p.id === editId ? data.child : p)))
      } else {
        setProfiles((prev) => [...prev, data.child])
      }
      setForm(emptyForm); setEditId(null); setShowForm(false)
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
    setSaveError(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo profilo bambino?')) return
    await fetch(`/api/profile/children?id=${id}`, { method: 'DELETE' })
    setProfiles((prev) => prev.filter((p) => p.id !== id))
    try { sessionStorage.removeItem('fiabe_family_v1') } catch {}
  }

  const toggleTheme = (theme: string) => {
    setForm((f) => ({
      ...f,
      favorite_themes: f.favorite_themes.includes(theme)
        ? f.favorite_themes.filter((t) => t !== theme)
        : [...f.favorite_themes, theme],
    }))
  }

  const openAdd = () => {
    setForm(emptyForm); setEditId(null); setShowForm(true); setSaveError(null)
  }

  const closeForm = () => {
    setShowForm(false); setEditId(null); setForm(emptyForm); setSaveError(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  const canAdd = profiles.length < MAX_PROFILES

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header
        className="px-6 py-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ArrowLeft size={13} /> Dashboard
        </Link>
        <span style={{ color: 'var(--border)' }}>|</span>
        <h1 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Profili bambini</h1>
        <div className="flex-1" />
        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
          {profiles.length} / {MAX_PROFILES}
        </span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Profile grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                I tuoi bambini
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                Puoi aggiungere fino a {MAX_PROFILES} profili
              </p>
            </div>
            {canAdd && !showForm && (
              <Button size="sm" onClick={openAdd} className="gap-1.5">
                <Plus size={13} /> Aggiungi
              </Button>
            )}
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profiles.map((profile, i) => (
              <motion.div
                key={profile.id}
                className="rounded-lg p-4 flex items-start gap-3"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                >
                  {profile.avatar_emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate" style={{ color: 'var(--foreground)' }}>
                    {profile.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {profile.age} anni
                    {profile.gender !== 'other' && (
                      <span className="ml-1.5">{profile.gender === 'male' ? '👦' : '👧'}</span>
                    )}
                  </p>
                  {profile.favorite_themes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {profile.favorite_themes.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: 'var(--surface-2)', color: 'var(--muted-foreground)' }}
                        >
                          {t}
                        </span>
                      ))}
                      {profile.favorite_themes.length > 3 && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: 'var(--surface-2)', color: 'var(--muted-foreground)' }}
                        >
                          +{profile.favorite_themes.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(profile)}
                    className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:opacity-80"
                    style={{ backgroundColor: 'var(--surface-2)', color: 'var(--muted-foreground)' }}
                    title="Modifica"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(profile.id)}
                    className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:opacity-80"
                    style={{ backgroundColor: 'rgba(251,113,133,0.1)', color: '#fb7185' }}
                    title="Elimina"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Empty slot CTAs (show up to 3 empty slots if under limit) */}
            {!showForm && canAdd && profiles.length < 3 &&
              Array.from({ length: Math.min(3 - profiles.length, MAX_PROFILES - profiles.length) }).map((_, i) => (
                <motion.button
                  key={`empty-${i}`}
                  onClick={openAdd}
                  className="rounded-lg p-4 flex items-center gap-3 text-left transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px dashed var(--border)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (profiles.length + i) * 0.05 }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--surface-2)' }}
                  >
                    <Plus size={20} style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>
                      Aggiungi bambino
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--border)' }}>
                      Tocca per creare un profilo
                    </p>
                  </div>
                </motion.button>
              ))
            }
          </div>
        </section>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.section
              className="rounded-lg p-5 space-y-5"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
                  {editId ? 'Modifica profilo' : 'Nuovo profilo bambino'}
                </h3>
                <button
                  onClick={closeForm}
                  className="w-7 h-7 rounded flex items-center justify-center"
                  style={{ backgroundColor: 'var(--surface-2)', color: 'var(--muted-foreground)' }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Avatar picker */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                  Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setForm((f) => ({ ...f, avatar_emoji: emoji }))}
                      className="w-10 h-10 text-xl rounded-lg transition-all"
                      style={{
                        backgroundColor: form.avatar_emoji === emoji ? 'var(--accent-dim)' : 'var(--surface-2)',
                        border: `1px solid ${form.avatar_emoji === emoji ? 'var(--primary)' : 'var(--border)'}`,
                        transform: form.avatar_emoji === emoji ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name + Age + Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                    Nome *
                  </label>
                  <Input
                    placeholder="Nome"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
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
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
                    Genere
                  </label>
                  <select
                    className="w-full h-9 rounded border px-3 text-sm"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--surface-2)',
                      color: 'var(--foreground)',
                    }}
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
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>
                  Temi preferiti
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {THEME_OPTIONS.map((theme) => {
                    const active = form.favorite_themes.includes(theme)
                    return (
                      <button
                        key={theme}
                        onClick={() => toggleTheme(theme)}
                        className="px-2.5 py-1 rounded text-xs font-semibold transition-colors"
                        style={{
                          backgroundColor: active ? 'var(--accent-dim)' : 'var(--surface-2)',
                          color: active ? 'var(--primary)' : 'var(--muted-foreground)',
                          border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                        }}
                      >
                        {theme}
                      </button>
                    )
                  })}
                </div>
              </div>

              {saveError && (
                <div
                  className="rounded p-3 text-xs"
                  style={{ backgroundColor: 'rgba(251,113,133,0.1)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.2)' }}
                >
                  {saveError}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button variant="ghost" onClick={closeForm} size="sm">
                  Annulla
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim() || !form.age}
                  size="sm"
                  className="flex-1 gap-1.5"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #e879f9)', color: 'white' }}
                >
                  {saving ? (
                    <><Loader2 size={13} className="animate-spin" /> Salvataggio...</>
                  ) : (
                    <><Save size={13} /> {editId ? 'Aggiorna profilo' : 'Salva profilo'}</>
                  )}
                </Button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Go to dashboard CTA */}
        {profiles.length > 0 && !showForm && (
          <div className="pt-2">
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
              style={{ background: 'linear-gradient(135deg, #a855f7, #e879f9)', color: 'white' }}
            >
              ✨ Vai al catalogo storie
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
