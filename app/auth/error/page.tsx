import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-destructive/15 text-destructive">
          <AlertTriangle className="size-6" />
        </div>
        <h1 className="text-xl font-bold">Bir hata oluştu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kimlik doğrulama tamamlanamadı. Lütfen tekrar giriş yapmayı deneyin.
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
