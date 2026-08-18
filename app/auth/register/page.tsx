'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/config'
import { Logo } from '@/components/brand'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<null | 'session' | 'confirm'>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      setError('Supabase bağlantısı yapılandırılmamış.')
      return
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
        data: {
          username: username.trim(),
          display_name: displayName.trim() || username.trim(),
        },
      },
    })
    if (error) {
      if (error.message.toLowerCase().includes('already') || error.message.toLowerCase().includes('registered')) {
        setError('Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin.')
      } else if (error.message.toLowerCase().includes('password')) {
        setError('Şifre çok zayıf. Daha güçlü bir şifre seçin.')
      } else if (error.message.toLowerCase().includes('rate')) {
        setError('Çok fazla deneme. Lütfen biraz sonra tekrar deneyin.')
      } else {
        setError('Kayıt oluşturulamadı. Lütfen tekrar deneyin.')
      }
      setLoading(false)
      return
    }
    setLoading(false)
    if (data.session) {
      router.push('/')
      router.refresh()
    } else {
      setDone('confirm')
    }
  }

  if (done === 'confirm') {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-primary/15 text-primary">
            <MailCheck className="size-6" />
          </div>
          <h1 className="text-xl font-bold">E-postanızı onaylayın</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {email} adresine bir onay bağlantısı gönderdik. Hesabınızı
            etkinleştirmek için bağlantıya tıklayın.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
          >
            Giriş sayfasına dön
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo className="text-2xl" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h1 className="text-xl font-bold">Kayıt ol</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            WusoHub topluluğuna katılın.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Field label="Görünen ad">
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="auth-input"
                placeholder="Adınız"
              />
            </Field>
            <Field label="Kullanıcı adı">
              <input
                type="text"
                required
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                }
                className="auth-input"
                placeholder="kullaniciadi"
              />
            </Field>
            <Field label="E-posta">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="ornek@eposta.com"
              />
            </Field>
            <Field label="Şifre">
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                placeholder="En az 6 karakter"
              />
            </Field>
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" disabled={loading} className="h-10 w-full">
              {loading && <Loader2 className="size-4 animate-spin" />}
              Hesap oluştur
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Zaten hesabınız var mı?{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}
