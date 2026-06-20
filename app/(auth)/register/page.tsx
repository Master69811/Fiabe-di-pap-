'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Inserisci il tuo nome'),
  email: z.string().email('Email non valida'),
  password: z
    .string()
    .min(8, 'La password deve avere almeno 8 caratteri'),
  terms: z.boolean().refine((v) => v === true, {
    message: 'Devi accettare i termini per continuare',
  }),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.name },
      },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    router.push('/voice-setup')
    router.refresh()
  }

  return (
    <div
      className="rounded-2xl border p-8 shadow-lg"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--foreground)' }}>
        Crea il tuo account
      </h2>
      <p className="text-center mb-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Inizia a raccontare storie magiche con la tua voce
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            Il tuo nome
          </label>
          <Input
            type="text"
            placeholder="Marco"
            {...register('name')}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            Email
          </label>
          <Input
            type="email"
            placeholder="la-tua@email.it"
            {...register('email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            Password
          </label>
          <Input
            type="password"
            placeholder="Minimo 8 caratteri"
            {...register('password')}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            {...register('terms')}
            className="mt-1 h-4 w-4 rounded"
            style={{ accentColor: 'var(--primary)' }}
          />
          <label
            htmlFor="terms"
            className="text-sm leading-relaxed"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Accetto i{' '}
            <span className="underline cursor-pointer" style={{ color: 'var(--primary)' }}>
              Termini di servizio
            </span>{' '}
            e la{' '}
            <span className="underline cursor-pointer" style={{ color: 'var(--primary)' }}>
              Privacy Policy
            </span>
            . Comprendo che la mia voce verrà elaborata da ElevenLabs per creare il clone vocale.
          </label>
        </div>
        {errors.terms && (
          <p className="text-red-500 text-xs">{errors.terms.message}</p>
        )}

        {error && (
          <div
            className="rounded-xl p-3 text-sm text-red-700 text-center"
            style={{ backgroundColor: '#fee2e2' }}
          >
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Creazione account...
            </>
          ) : (
            '🎙️ Crea account e configura la voce'
          )}
        </Button>
      </form>

      <p className="text-center mt-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Hai già un account?{' '}
        <Link
          href="/login"
          className="font-semibold hover:underline"
          style={{ color: 'var(--primary)' }}
        >
          Accedi
        </Link>
      </p>
    </div>
  )
}
