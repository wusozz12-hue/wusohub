import Link from 'next/link'

const trends = [
  { title: 'Teknoloji gündemi', count: '12,4 B gönderi' },
  { title: 'Yapay zekâ', count: '8,7 B gönderi' },
  { title: 'Web geliştirme', count: '5,2 B gönderi' },
  { title: 'WusoHub', count: '1,9 B gönderi' },
]

export function TrendsSidebar() {
  return (
    <aside className="hidden w-80 shrink-0 space-y-4 lg:block">
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="px-4 py-4">
          <h2 className="text-lg font-bold">Gündem</h2>
          <p className="mt-1 text-sm text-muted-foreground">WusoHub'da konuşulanlar</p>
        </div>
        <div className="divide-y divide-border">
          {trends.map((trend) => (
            <Link key={trend.title} href="/?sort=popular" className="block px-4 py-3 transition-colors hover:bg-muted/50">
              <p className="text-sm font-semibold">{trend.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{trend.count}</p>
            </Link>
          ))}
        </div>
        <Link href="/?sort=popular" className="block px-4 py-3 text-sm text-primary hover:bg-muted/50">
          Daha fazlasını göster
        </Link>
      </section>
    </aside>
  )
}
