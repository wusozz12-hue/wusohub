import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/server-data'

export default async function AdminPage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    redirect('/auth/login')
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold">Yönetim Paneli</h1>
      <p className="mt-2 text-muted-foreground">
        WusoHub yönetim merkezi
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Kullanıcılar</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Kullanıcı yönetimi
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Gönderiler</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Gönderileri yönet
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Raporlar</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Bildirilen içerikleri incele
          </p>
        </div>
      </div>
    </main>
  )
}
