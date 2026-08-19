'use client'

import { useEffect, useState } from 'react'
import { Video, ExternalLink } from 'lucide-react'

type VideoItem = {
  id: number
  title: string
  src: string
  poster: string | null
  author: string
  authorUrl: string
  sourceUrl: string
}

export function FeaturedVideoFeed() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch('/api/videos')
      .then(async (response) => {
        if (!response.ok) throw new Error('Video feed unavailable')
        return response.json()
      })
      .then((data) => {
        if (!cancelled) setVideos(data.videos ?? [])
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="border-b border-border px-4 py-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">En iyi videolar</h2>
          <p className="text-xs text-muted-foreground">Komik, korkunç ve şaşırtıcı videolar</p>
        </div>
        <Video className="size-5 text-muted-foreground" />
      </div>

      {loading && <p className="py-8 text-center text-sm text-muted-foreground">Videolar yükleniyor...</p>}

      {error && (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Video akışı şu anda hazır değil. Yönetici panelindeki Pexels API anahtarını ekledikten sonra 100+ video burada otomatik görünecek.
        </div>
      )}

      {!loading && !error && videos.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">Henüz video bulunamadı.</p>
      )}

      <div className="space-y-6">
        {videos.map((video) => (
          <article key={video.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative bg-black">
              <video
                className="max-h-[720px] w-full object-contain"
                src={video.src}
                poster={video.poster ?? undefined}
                controls
                playsInline
                preload="metadata"
              />
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold">{video.title}</p>
              <a
                href={video.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {video.author} · Pexels <ExternalLink className="size-3" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
