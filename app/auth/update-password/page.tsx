'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/config'
import { Logo } from '@/components/brand'
import { Button } from '@/components/ui/button'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError('Supabase bağlantısı yapılandırılmamış.')
      return
    }

    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session))
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.')
      return
    }
    if (password !== confirm) {
      setError('Şifreler eşleşmiyor.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Şifre yenilenemedi. Bağlantıyı yeniden isteyip tekrar deneyin.')
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo className="text-2xl" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h1 className="text-xl font-bold">Yeni şifre belirle</h1>

          {success ? (
            <div className="mt-6 space-y-4">
              <p className="rounded-lg bg-primary/10 px-3 py-3 text-sm">
                Şifren başarıyla yenilendi. Artık yeni şifrenle giriş yapabilirsin.
              </p>
              <Link href="/auth/login" className="block text-center text-sm font-medium text-primary hover:underline">
                Giriş yap
              </Link>
            </div>
          ) : !ready ? (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Şifre yenileme bağlantısı geçersiz veya süresi dolmuş olabilir.
              </p>
              <Link href="/auth/forgot-password" className="block text-center text-sm font-medium text-primary hover:underline">
                Yeni bağlantı iste
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium">Yeni şifre</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm" className="text-sm font-medium">Yeni şifre tekrar</label>
                <input
                  id="confirm"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                />
              </div>
              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" size="lg" disabled={loading} className="h-10 w-full">
                {loading && <Loader2 className="size-4 animate-spin" />}
                Şifreyi yenile
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
