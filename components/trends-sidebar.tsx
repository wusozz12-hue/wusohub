import Link from 'next/link'

const trends = [
  { title: 'Teknoloji gündemi', count: '12,4 B gönderi' },
  { title: 'Yapay zekâ', count: '8,7 B gönderi' },
  { title: 'Web geliştirme', count: '5,2 B gönderi' },
  { title: 'WusoHub', count: '1,9 B gönderi' },
]

const news = [
  {
    title: 'Teknoloji ve yazılım gündemi',
    source: 'X / Teknoloji',
    href: 'https://x.com/search?q=teknoloji%20yaz%C4%B1l%C4%B1m&src=typed_query&f=live',
  },
  {
    title: 'Yapay zekâ dünyasından son gelişmeler',
    source: 'X / Yapay Zekâ',
    href: 'https://x.com/search?q=yapay%20zeka&src=typed_query&f=live',
  },
  {
    title: 'Gündemdeki son haberler',
    source: 'Google News',
    href: 'https://news.google.com/search?q=teknoloji&hl=tr&gl=TR&ceid=TR%3Atr',
  },
]

const videos = [
  {
    title: 'X\'te popüler videolar',
    source: 'X Video',
    href: 'https://x.com/search?q=video&src=typed_query&f=live',
  },
  {
    title: 'Teknoloji videoları',
    source: 'TikTok',
    href: 'https://www.tiktok.com/tag/teknoloji',
  },
  {
    title: 'Gündem videoları',
    source: 'TikTok',
    href: 'https://www.tiktok.com/tag/gundem',
  },
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
          <p className="mt-1 text-sm text-muted-foreground">Teknoloji ve güncel gelişmeler</p>
        </div>
        <div className="divide-y divide-border">
          {news.map((item) => (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <p className="text-sm font-semibold leading-5">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.source} · Aç</p>
            </a>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="px-4 py-4">
          <h2 className="text-lg font-bold">Videolar</h2>
          <p className="mt-1 text-sm text-muted-foreground">X ve TikTok'taki güncel videolara hızlı erişim</p>
        </div>
        <div className="divide-y divide-border">
          {videos.map((video) => (
            <a
              key={video.title}
              href={video.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-muted/50"
            >
              <div>
                <p className="text-sm font-semibold">{video.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{video.source}</p>
              </div>
              <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">İzle</span>
            </a>
          ))}
        </div>
      </section>
    </aside>
  )
}
