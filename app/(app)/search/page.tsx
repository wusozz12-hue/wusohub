import Link from 'next/link'

export default function SearchPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Arama</h1>

      <div className="mt-6">
        <input
          type="search"
          placeholder="Kullanıcı veya gönderi ara..."
          className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm outline-none"
        />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Arama yapmak için yukarıdaki alanı kullanın.
      </p>

      <Link
        href="/"
        className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
      >
        Ana sayfaya dön
      </Link>
    </main>
  )
} 
