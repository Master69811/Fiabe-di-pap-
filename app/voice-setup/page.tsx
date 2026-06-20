'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { VoiceSetupGuide } from '@/components/VoiceSetupGuide'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VoiceSetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleComplete = async (voiceId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/family/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Errore nel salvataggio. Riprova.')
        setIsLoading(false)
        return
      }
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch {
      setError('Errore di rete. Controlla la connessione e riprova.')
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Header */}
      <header
        className="border-b px-4 py-3 flex items-center gap-3"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm hover:underline"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ArrowLeft size={16} /> Torna alla dashboard
        </Link>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          🎙️ Configura la tua voce
        </span>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          {success ? (
            <motion.div
              className="text-center space-y-4 py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle
                size={64}
                className="mx-auto"
                style={{ color: 'var(--secondary)' }}
              />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                Voce configurata! 🎉
              </h2>
              <p style={{ color: 'var(--muted-foreground)' }}>
                La tua voce è pronta. Reindirizzo alla dashboard...
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                  Configura la tua voce
                </h1>
                <p style={{ color: 'var(--muted-foreground)' }}>
                  Segui questi tre passi per creare il tuo clone vocale. Lo farai una volta sola.
                </p>
              </div>

              {error && (
                <div
                  className="rounded-xl p-4 text-sm"
                  style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
                >
                  {error}
                </div>
              )}

              <VoiceSetupGuide onSave={handleComplete} />

              <p className="text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Puoi saltare questo passaggio e configurarlo in seguito dalla pagina{' '}
                <Link href="/dashboard" className="underline" style={{ color: 'var(--primary)' }}>
                  Voce
                </Link>
                .
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
