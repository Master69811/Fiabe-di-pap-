'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ExternalLink, Mic, Copy, Key, Save, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface VoiceSetupGuideProps {
  onSave: (voiceId: string) => Promise<void>
  initialVoiceId?: string
}

const steps = [
  {
    number: 1,
    title: 'Crea un account ElevenLabs',
    icon: '🔑',
    description:
      'ElevenLabs è la piattaforma di clonazione vocale AI che usiamo. Crea un account gratuito su elevenlabs.io.',
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          ElevenLabs offre un piano gratuito con cui puoi creare la tua voce clonata e generare
          minuti di audio ogni mese.
        </p>
        <a
          href="https://elevenlabs.io/sign-up"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Vai su ElevenLabs
          <ExternalLink size={14} />
        </a>
        <div
          className="rounded-xl p-4 text-sm"
          style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
        >
          <strong>Suggerimento:</strong> Il piano gratuito include 10.000 caratteri al mese — più
          che sufficienti per diverse fiabe!
        </div>
      </div>
    ),
  },
  {
    number: 2,
    title: 'Registra la tua voce',
    icon: '🎙️',
    description:
      'Vai su Voice Lab e crea un clone della tua voce. Bastano pochi minuti di registrazione.',
    content: (
      <div className="space-y-4">
        <ol className="space-y-3">
          {[
            'Accedi a ElevenLabs e vai su "Voice Lab" nel menu',
            'Clicca su "Add Voice" → "Instant Voice Clone"',
            'Dai un nome alla tua voce (es. "Voce di Papà")',
            'Carica una registrazione audio di almeno 1 minuto',
            'Clicca "Add Voice" per creare il clone',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {i + 1}
              </span>
              <span style={{ color: 'var(--foreground)' }}>{step}</span>
            </li>
          ))}
        </ol>
        <div
          className="rounded-xl p-4 space-y-2"
          style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}
        >
          <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
            Consigli per una buona registrazione:
          </p>
          <ul className="text-sm space-y-1" style={{ color: '#78350f' }}>
            <li>🎤 Usa un microfono di buona qualità (anche quello degli auricolari va bene)</li>
            <li>🔇 Registra in un ambiente silenzioso</li>
            <li>📖 Leggi ad alta voce una storia o un articolo</li>
            <li>😊 Parla con il tono che usi quando racconti storie ai tuoi figli</li>
            <li>⏱️ Più registrazione carica, migliore sarà il clone (aim: 3-5 minuti)</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    number: 3,
    title: 'Copia il Voice ID',
    icon: '🔗',
    description: 'Dopo aver creato la voce, copia il suo ID univoco da ElevenLabs.',
    content: (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          Il Voice ID è il codice univoco che identifica la tua voce clonata.
        </p>
        <ol className="space-y-3">
          {[
            'Vai su "Voice Lab" → "My Voices"',
            'Clicca sulla voce che hai appena creato',
            'Clicca sull\'icona "Copy Voice ID" (a destra del nome)',
            'Tieni il codice copiato negli appunti',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                style={{ backgroundColor: 'var(--secondary)' }}
              >
                {i + 1}
              </span>
              <span style={{ color: 'var(--foreground)' }}>{step}</span>
            </li>
          ))}
        </ol>
        <div
          className="rounded-xl p-4 text-sm"
          style={{ backgroundColor: 'var(--muted)' }}
        >
          <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
            Il Voice ID assomiglia a questo:
          </p>
          <code
            className="text-xs px-2 py-1 rounded font-mono break-all"
            style={{ backgroundColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            21m00Tcm4TlvDq8ikWAM
          </code>
        </div>
      </div>
    ),
  },
]

export function VoiceSetupGuide({ onSave, initialVoiceId = '' }: VoiceSetupGuideProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [voiceId, setVoiceId] = useState(initialVoiceId)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!voiceId.trim()) return
    setIsSaving(true)
    try {
      await onSave(voiceId.trim())
      setSaved(true)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {steps.map((step, idx) => (
          <div key={step.number} className="flex items-center gap-2">
            <button
              onClick={() => setActiveStep(idx)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                idx === activeStep ? 'text-white scale-110' : 'text-white'
              }`}
              style={{
                backgroundColor:
                  idx < activeStep
                    ? 'var(--secondary)'
                    : idx === activeStep
                    ? 'var(--primary)'
                    : 'var(--border)',
                color: idx >= activeStep ? (idx === activeStep ? '#fff' : 'var(--muted-foreground)') : '#fff',
              }}
            >
              {idx < activeStep ? <CheckCircle size={16} /> : step.number}
            </button>
            {idx < steps.length - 1 && (
              <div
                className="h-0.5 flex-1 min-w-8 transition-colors"
                style={{
                  backgroundColor: idx < activeStep ? 'var(--secondary)' : 'var(--border)',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl p-6 border"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{steps[activeStep].icon}</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>
                Passo {steps[activeStep].number} di {steps.length}
              </p>
              <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                {steps[activeStep].title}
              </h3>
            </div>
          </div>
          <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            {steps[activeStep].description}
          </p>
          {steps[activeStep].content}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
          disabled={activeStep === 0}
          size="sm"
        >
          <ChevronLeft size={16} />
          Indietro
        </Button>
        <Button
          onClick={() => {
            if (activeStep < steps.length - 1) {
              setActiveStep((s) => s + 1)
            }
          }}
          disabled={activeStep === steps.length - 1}
          size="sm"
        >
          Avanti
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Voice ID input */}
      <div
        className="rounded-2xl p-6 border-2 space-y-4"
        style={{ borderColor: 'var(--primary)', borderStyle: 'dashed', backgroundColor: 'var(--muted)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Key size={18} style={{ color: 'var(--primary)' }} />
          <h4 className="font-bold" style={{ color: 'var(--foreground)' }}>
            Inserisci il tuo Voice ID
          </h4>
        </div>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Dopo aver creato la tua voce su ElevenLabs, incolla qui il Voice ID.
        </p>
        <div className="flex gap-3">
          <Input
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            placeholder="es. 21m00Tcm4TlvDq8ikWAM"
            className="flex-1 font-mono text-sm"
          />
          <Button
            onClick={handleSave}
            disabled={!voiceId.trim() || isSaving || saved}
            className="gap-2"
          >
            {saved ? (
              <>
                <CheckCircle size={16} />
                Salvato!
              </>
            ) : isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvo...
              </>
            ) : (
              <>
                <Save size={16} />
                Salva
              </>
            )}
          </Button>
        </div>
        {saved && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold"
            style={{ color: 'var(--secondary)' }}
          >
            ✅ Voce configurata! Ora puoi ascoltare le storie con la tua voce.
          </motion.p>
        )}
      </div>
    </div>
  )
}
