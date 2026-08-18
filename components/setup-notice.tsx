import { Database, KeyRound, Terminal } from 'lucide-react'
import { Logo } from '@/components/brand'

export function SetupNotice() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-8 px-6 py-16">
      <Logo className="text-2xl" />
      <div className="w-full rounded-2xl border border-border bg-card p-8">
        <h1 className="text-balance text-2xl font-bold">
          WusoHub&apos;a hoş geldiniz
        </h1>
        <p className="mt-2 text-pretty text-muted-foreground">
          Uygulama tamamen hazır. Çalışması için yalnızca Supabase bağlantınızı
          eklemeniz yeterli. Aşağıdaki üç adımı tamamlayın:
        </p>

        <ol className="mt-6 flex flex-col gap-4">
          <li className="flex gap-3">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-silver">
              <KeyRound className="size-4" />
            </span>
            <div>
              <p className="font-medium">1. Ortam değişkenlerini ekleyin</p>
              <p className="text-sm text-muted-foreground">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>{' '}
                ve{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </code>{' '}
                değerlerini projenize ekleyin (bkz. <code>.env.example</code>).
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-silver">
              <Database className="size-4" />
            </span>
            <div>
              <p className="font-medium">2. Veritabanı şemasını kurun</p>
              <p className="text-sm text-muted-foreground">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  scripts/001_wusohub_schema.sql
                </code>{' '}
                dosyasını Supabase SQL editöründe çalıştırın. Tüm tablolar, RLS
                politikaları ve depolama alanları oluşturulacaktır.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-silver">
              <Terminal className="size-4" />
            </span>
            <div>
              <p className="font-medium">3. Yeniden yükleyin</p>
              <p className="text-sm text-muted-foreground">
                Değişkenler eklendikten sonra sayfayı yenileyin. WusoHub
                otomatik olarak çalışmaya başlayacaktır.
              </p>
            </div>
          </li>
        </ol>
      </div>
    </main>
  )
}
