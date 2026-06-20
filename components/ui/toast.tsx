'use client'

import * as React from 'react'
import { useEffect, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastVariant = 'default' | 'destructive' | 'success'

export interface ToastData {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

// Global toast store
let toastCount = 0
type ToastListener = (toast: ToastData) => void
const listeners: ToastListener[] = []

function addListener(fn: ToastListener) {
  listeners.push(fn)
  return () => {
    const idx = listeners.indexOf(fn)
    if (idx > -1) listeners.splice(idx, 1)
  }
}

function emitToast(t: ToastData) {
  listeners.forEach((fn) => fn(t))
}

export function toast(options: Omit<ToastData, 'id'>) {
  const id = String(++toastCount)
  emitToast({ id, duration: 4000, ...options })
  return id
}

// Single toast item component
function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Animate in
    const show = setTimeout(() => setVisible(true), 10)
    // Animate out before removal
    const hide = setTimeout(() => setVisible(false), (toast.duration ?? 4000) - 300)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [toast.duration])

  const variantStyle: React.CSSProperties =
    toast.variant === 'destructive'
      ? { backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b' }
      : toast.variant === 'success'
      ? { backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#166534' }
      : { backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }

  const Icon =
    toast.variant === 'destructive'
      ? AlertCircle
      : toast.variant === 'success'
      ? CheckCircle
      : Info

  const iconColor =
    toast.variant === 'destructive'
      ? '#ef4444'
      : toast.variant === 'success'
      ? '#22c55e'
      : 'var(--primary)'

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border p-4 shadow-lg transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
      style={variantStyle}
    >
      <Icon size={20} style={{ color: iconColor, flexShrink: 0, marginTop: 2 }} />
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-semibold text-sm">{toast.title}</p>}
        {toast.description && (
          <p className="text-sm mt-0.5 opacity-80">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  )
}

// Toaster container
export function Toaster() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    const unsubscribe = addListener((newToast) => {
      setToasts((prev) => [...prev, newToast])
      setTimeout(() => removeToast(newToast.id), newToast.duration ?? 4000)
    })
    return unsubscribe
  }, [removeToast])

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm"
      role="region"
      aria-label="Notifiche"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  )
}
