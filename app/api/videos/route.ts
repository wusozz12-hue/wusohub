import { NextResponse } from 'next/server'

const QUERIES = ['funny', 'scary', 'unexpected']
const TARGET_PER_QUERY = 40

export async function GET() {
  const apiKey = process.env.PEXELS_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'PEXELS_API_KEY is not configured.' },
      { status: 503 },
    )
  }

  try {
    const results = await Promise.all(
      QUERIES.map(async (query) => {
        const url = new URL('https://api.pexels.com/v1/videos/search')
        url.searchParams.set('query', query)
        url.searchParams.set('per_page', String(TARGET_PER_QUERY))
        url.searchParams.set('orientation', 'portrait')
        url.searchParams.set('size', 'medium')

        const response = await fetch(url, {
          headers: { Authorization: apiKey },
          next: { revalidate: 3600 },
        })

        if (!response.ok) throw new Error(`Pexels request failed: ${response.status}`)
        return response.json()
      }),
    )

    const videos = results
      .flatMap((result) => result.videos ?? [])
      .filter((video, index, all) => all.findIndex((item) => item.id === video.id) === index)
      .slice(0, 120)
      .map((video) => {
        const files = (video.video_files ?? [])
          .filter((file: { file_type?: string; width?: number; link?: string }) => file.file_type === 'video/mp4' && file.link)
          .sort((a: { width?: number }, b: { width?: number }) => (b.width ?? 0) - (a.width ?? 0))

        return {
          id: video.id,
          title: 'WusoHub keşfet videosu',
          src: files[0]?.link ?? null,
          poster: video.image ?? null,
          author: video.user?.name ?? 'Pexels Creator',
          authorUrl: video.user?.url ?? 'https://www.pexels.com',
          sourceUrl: video.url ?? 'https://www.pexels.com',
        }
      })
      .filter((video) => video.src)

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Video feed error:', error)
    return NextResponse.json({ error: 'Video feed could not be loaded.' }, { status: 502 })
  }
}
