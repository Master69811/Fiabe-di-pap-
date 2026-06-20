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
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
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
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (authError) {
      setError('Email o password non corretti. Riprova.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      className="rounded-3xl border p-8 shadow-xl"
      style={{ backgroundColor: 'white', borderColor: '#e9d5ff' }}
    >
      <h2 className="text-2xl font-black mb-2 text-center" style={{ color: '#4c1d95' }}>
        Bentornato! 👑
      </h2>
      <p className="text-center mb-8 text-sm font-medium" style={{ color: '#7c3aed' }}>
        Accedi per continuare le storie
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            placeholder="••••••••"
            {...register('password')}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <div
            className="rounded-xl p-3 text-sm text-red-700 text-center"
            style={{ backgroundColor: '#fee2e2' }}
          >
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading}
          style={{ background: 'linear-gradient(135deg, #7c3aed, #c026d3)', color: 'white' }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Accesso in corso...
            </>
          ) : (
            '✨ Accedi'
          )}
        </Button>
      </form>

      <p className="text-center mt-6 text-sm font-medium" style={{ color: '#7c3aed' }}>
        Non hai ancora un account?{' '}
        <Link href="/register" className="font-black hover:underline" style={{ color: '#c026d3' }}>
          Registrati gratis
        </Link>
      </p>
    </div>
  )
}
