import Link from 'next/link'

const trends = [
  { title: 'Teknoloji gündemi', count: '12,4 B gönderi' },
  { title: 'Yapay zekâ', count: '8,7 B gönderi' },
  { title: 'Web geliştirme', count: '5,2 B gönderi' },
  { title: 'WusoHub', count: '1,9 B gönderi' },
]

const news = [
  { title: 'Teknoloji ve yazılım gündemini takip et', source: 'WusoHub Gündem' },
  { title: 'Yeni web teknolojileri ve geliştirici haberleri', source: 'WusoHub Teknoloji' },
  { title: 'Yapay zekâ dünyasından son gelişmeler', source: 'WusoHub AI' },
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

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="px-4 py-4">
          <h2 className="text-lg font-bold">Haberler</h2>
          <p className="mt-1 text-sm text-muted-foreground">Teknoloji ve yazılım gündemi</p>
        </div>
        <div className="divide-y divide-border">
          {news.map((item) => (
            <div key={item.title} className="px-4 py-3">
              <p className="text-sm font-semibold leading-5">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.source}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="px-4 py-4">
          <h2 className="text-lg font-bold">Videolar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Popüler video içerikleri</p>
        </div>
        <div className="mx-4 mb-4 flex aspect-video items-center justify-center rounded-xl bg-muted text-center text-sm text-muted-foreground">
          Video akışı yakında burada
        </div>
      </section>
    </aside>
  )
}
