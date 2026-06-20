'use client'

import { useState, useCallback } from 'react'

export type ToastVariant = 'default' | 'destructive' | 'success'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastState {
  toasts: Toast[]
}

let toastCount = 0

// Simple event emitter for cross-component toast communication
type ToastListener = (toast: Toast) => void
const listeners: ToastListener[] = []

function addListener(fn: ToastListener) {
  listeners.push(fn)
  return () => {
    const idx = listeners.indexOf(fn)
    if (idx > -1) listeners.splice(idx, 1)
  }
}

function emitToast(toast: Toast) {
  listeners.forEach((fn) => fn(toast))
}

export function toast(options: Omit<Toast, 'id'>) {
  const id = String(++toastCount)
  const newToast: Toast = { id, duration: 4000, ...options }
  emitToast(newToast)
  return id
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((newToast: Toast) => {
    setToasts((prev) => [...prev, newToast])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id))
    }, newToast.duration ?? 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Subscribe to global toasts
  useState(() => {
    return addListener(addToast)
  })

  return { toasts, removeToast, toast }
}
