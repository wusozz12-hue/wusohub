import Link from 'next/link'
import { searchProfiles } from '@/lib/queries'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const results = q ? await searchProfiles(q) : []

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Arama</h1>

      <form action="/search" method="get" className="mt-6 flex gap-2">
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Kullanıcı veya gönderi ara..."
          className="h-11 flex-1 rounded-lg border border-input bg-background px-4 text-sm outline-none"
        />

        <button
          type="submit"
          className="h-11 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Ara
        </button>
      </form>

      {q && (
        <div className="mt-6 space-y-3">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Kullanıcı bulunamadı.
            </p>
          ) : (
            results.map((profile) => (
              <Link
                key={profile.id}
                href={`/profile/${profile.username}`}
                className="block rounded-xl border p-4 hover:bg-muted/50"
              >
                <div className="font-semibold">
                  {profile.display_name || profile.username}
                  {profile.is_verified && (
                    <span className="ml-2 text-blue-500">✓</span>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  @{profile.username}
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {!q && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Kullanıcı aramak için yukarıdaki alanı kullanın.
        </p>
      )}

      <Link
        href="/"
        className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
      >
        Ana sayfaya dön
      </Link>
    </main>
  )
}
