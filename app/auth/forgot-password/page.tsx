'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/config'
import { Logo } from '@/components/brand'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!isSupabaseConfigured) {
      setError('Supabase bağlantısı yapılandırılmamış.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=/auth/update-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    if (error) {
      setError('Şifre sıfırlama e-postası gönderilemedi. Lütfen tekrar deneyin.')
    } else {
      setSent(true)
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
          <h1 className="text-xl font-bold">Şifremi unuttum</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            E-posta adresini gir. Şifre yenileme bağlantısını e-postana gönderelim.
          </p>

          {sent ? (
            <div className="mt-6 space-y-4">
              <p className="rounded-lg bg-primary/10 px-3 py-3 text-sm">
                Eğer bu e-posta ile kayıtlı bir hesap varsa, şifre yenileme bağlantısı gönderildi.
                Gelen kutunu ve spam klasörünü kontrol et.
              </p>
              <Link href="/auth/login" className="block text-center text-sm font-medium text-primary hover:underline">
                Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium">E-posta</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                  placeholder="ornek@eposta.com"
                />
              </div>
              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" size="lg" disabled={loading} className="h-10 w-full">
                {loading && <Loader2 className="size-4 animate-spin" />}
                Şifre yenileme bağlantısı gönder
              </Button>
              <Link href="/auth/login" className="text-center text-sm text-muted-foreground hover:text-foreground">
                Giriş sayfasına dön
              </Link>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
