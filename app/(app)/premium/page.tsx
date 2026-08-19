import { redirect } from 'next/navigation'
import { Check, ShieldCheck, Star } from 'lucide-react'
import { getCurrentProfile } from '@/lib/server-data'

export default async function PremiumPage() {
  const me = await getCurrentProfile()
  if (!me) redirect('/auth/login')

  const isPremiumActive = Boolean(
    me.is_premium && (!me.premium_until || new Date(me.premium_until) > new Date()),
  )

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <div className="border-b border-border bg-gradient-to-br from-primary/15 via-card to-amber-400/10 p-8">
          <div className="mb-4 flex items-center gap-2 text-amber-500">
            <Star className="size-6 fill-current" />
            <span className="font-semibold">WusoHub Premium</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Premium&apos;a geç, hesabını öne çıkar.</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Açılışa özel fiyat: <span className="font-semibold text-foreground">130 TL yerine 60 TL</span>.
          </p>
        </div>

        <div className="grid gap-3 p-8 sm:grid-cols-2">
          {[
            'Sarı Premium etiketi',
            'Mavi doğrulanmış rozet',
            'Profilde Premium görünümü',
            'Premium üyelik durumu ve ödeme geçmişi',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl border border-border p-4">
              <Check className="size-5 text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-border p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-muted-foreground line-through">130 TL</div>
            <div className="text-3xl font-bold">60 TL</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-4" /> Güvenli ödeme sağlayıcısı ile ödeme
            </div>
          </div>
          {isPremiumActive ? (
            <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-5 py-3 text-center font-semibold text-amber-500">
              Premium aktif ⭐
            </div>
          ) : (
            <div className="rounded-xl bg-primary px-6 py-3 text-center font-semibold text-primary-foreground">
              Ödeme sistemi bağlantısı bekleniyor
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
