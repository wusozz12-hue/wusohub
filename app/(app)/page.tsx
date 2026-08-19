import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PenSquare, Video } from 'lucide-react'
import { getCurrentProfile } from '@/lib/server-data'
import { getFeed } from '@/lib/queries'
import { PostCard } from '@/components/post-card'
import { TrendsSidebar } from '@/components/trends-sidebar'
import { cn } from '@/lib/utils'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
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
          <Link
            href="/create"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground md:hidden"
          >
            <PenSquare className="size-4" />
            Paylaş
          </Link>
        </div>

        <div className="flex border-b border-border">
          <SortTab label="En yeni" href="/" active={activeSort === 'new'} />
          <SortTab label="Popüler" href="/?sort=popular" active={activeSort === 'popular'} />
        </div>

        {posts.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="font-medium">Henüz gönderi yok.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              İlk gönderiyi sen paylaş!
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link
                href="/create"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                <PenSquare className="size-4" />
                Gönderi oluştur
              </Link>
              <Link
                href="/create?type=video"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Video className="size-4" />
                Video paylaş
              </Link>
            </div>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} me={meLite} />)
        )}
      </main>

      <TrendsSidebar />
    </div>
  )
}

function SortTab({
  label,
  href,
  active,
}: {
  label: string
  href: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex-1 border-b-2 py-3 text-center text-sm font-medium transition-colors',
        active
          ? 'border-primary text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </Link>
  )
}
