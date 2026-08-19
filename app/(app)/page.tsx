import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PenSquare, Video, Play } from 'lucide-react'
import { getCurrentProfile } from '@/lib/server-data'
import { getFeed } from '@/lib/queries'
import { PostCard } from '@/components/post-card'
import { TrendsSidebar } from '@/components/trends-sidebar'
import { cn } from '@/lib/utils'

const communityProfiles = [
  { name: 'Mert Kaya', username: '@mertkaya', followers: '12.4K', avatar: 'https://i.pravatar.cc/120?img=12' },
  { name: 'Lina Demir', username: '@linademir', followers: '48.7K', avatar: 'https://i.pravatar.cc/120?img=47' },
  { name: 'DarkWave', username: '@darkwave', followers: '8.9K', avatar: null },
  { name: 'Ece Yılmaz', username: '@eceyilmaz', followers: '125K', avatar: 'https://i.pravatar.cc/120?img=32' },
  { name: 'Arda Tech', username: '@ardatech', followers: '31.2K', avatar: 'https://i.pravatar.cc/120?img=68' },
  { name: 'Nova', username: '@nova', followers: '5.6K', avatar: null },
]

const featuredVideos = [
  { title: 'Bugünün keşfet videosu', author: 'Lina Demir', username: '@linademir', avatar: 'https://i.pravatar.cc/80?img=47', src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  { title: 'Teknoloji dünyasından kısa video', author: 'Arda Tech', username: '@ardatech', avatar: 'https://i.pravatar.cc/80?img=68', src: 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4' },
  { title: 'WusoHub keşfet', author: 'DarkWave', username: '@darkwave', avatar: null, src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
]

export default async function HomePage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const me = await getCurrentProfile()
  if (!me) redirect('/auth/login')

  const { sort } = await searchParams
  const activeSort = sort === 'popular' ? 'popular' : 'new'
  const posts = await getFeed(activeSort, me.id)

  const meLite = {
    id: me.id,
    is_founder: me.is_founder,
    is_suspended: me.is_suspended,
    username: me.username,
    display_name: me.display_name,
    avatar_url: me.avatar_url,
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl items-start justify-center gap-6">
      <main className="w-full max-w-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
          <h1 className="text-xl font-bold">Ana akış</h1>
          <Link href="/create" className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground md:hidden">
            <PenSquare className="size-4" /> Paylaş
          </Link>
        </div>

        <div className="flex border-b border-border">
          <SortTab label="En yeni" href="/" active={activeSort === 'new'} />
          <SortTab label="Popüler" href="/?sort=popular" active={activeSort === 'popular'} />
        </div>

        <section className="border-b border-border px-4 py-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">En iyi videolar</h2>
              <p className="text-xs text-muted-foreground">Videolar aşağı doğru sıralanır</p>
            </div>
            <Video className="size-5 text-muted-foreground" />
          </div>

          <div className="space-y-6">
            {featuredVideos.map((video) => (
              <article key={video.title} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="relative aspect-video bg-black">
                  <video className="h-full w-full object-contain" src={video.src} controls playsInline preload="metadata" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    {video.avatar ? <img src={video.avatar} alt="" className="size-10 rounded-full object-cover" /> : <div className="size-10 rounded-full bg-black" />}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{video.author}</p>
                      <p className="truncate text-xs text-muted-foreground">{video.username}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm">{video.title}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {posts.length === 0 ? (
          <>
            <div className="px-4 py-8 text-center">
              <p className="font-medium">Henüz gönderi yok.</p>
              <p className="mt-1 text-sm text-muted-foreground">İlk gönderiyi sen paylaş!</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link href="/create" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  <PenSquare className="size-4" /> Gönderi oluştur
                </Link>
                <Link href="/create?type=video" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                  <Video className="size-4" /> Video paylaş
                </Link>
              </div>
            </div>
            <section className="border-t border-border px-4 py-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Önerilen profiller</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {communityProfiles.map((profile) => (
                  <div key={profile.username} className="rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center gap-2">
                      {profile.avatar ? <img src={profile.avatar} alt="" className="size-10 rounded-full object-cover" /> : <div className="size-10 rounded-full bg-black" />}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{profile.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{profile.username}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{profile.followers} takipçi</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} me={meLite} />)
        )}
      </main>
      <TrendsSidebar />
    </div>
  )
}

function SortTab({ label, href, active }: { label: string; href: string; active: boolean }) {
  return <Link href={href} className={cn('flex-1 border-b-2 py-3 text-center text-sm font-medium transition-colors', active ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>{label}</Link>
}
