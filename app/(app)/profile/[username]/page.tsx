import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { CalendarDays, Pencil, Video, Play } from "lucide-react"
import { getCurrentProfile } from "@/lib/server-data"
import {
  getProfileByUsername,
  getFollowStats,
  getPostsByUser,
} from "@/lib/queries"
import { Avatar } from "@/components/user-bits"
import { VerifiedBadge, FounderLabel } from "@/components/brand"
import { FollowButton } from "@/components/follow-button"
import { PostCard } from "@/components/post-card"
import { ProfileUserMenu } from "@/components/profile-user-menu"
import { formatCount } from "@/lib/format"

const profileVideos = [
  {
    title: "WusoHub keşfet videosu",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
  {
    title: "Teknoloji gündeminden kısa video",
    src: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
  },
  {
    title: "Bugünün popüler videosu",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  },
]

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const me = await getCurrentProfile()

  if (!me) redirect("/auth/login")

  const { username } = await params
  const { tab } = await searchParams
  const profile = await getProfileByUsername(username)

  if (!profile) notFound()

  const isMe = profile.id === me.id
  const [stats, posts] = await Promise.all([
    getFollowStats(profile.id, me.id),
    getPostsByUser(profile.id, me.id),
  ])

  const meLite = {
    id: me.id,
    is_founder: me.is_founder,
    is_suspended: me.is_suspended,
    username: me.username,
    display_name: me.display_name,
    avatar_url: me.avatar_url,
  }

  const joined = new Date(profile.created_at).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
  })

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="border-b border-border px-4 py-6">
        <div className="flex items-start justify-between gap-4">
          <Avatar profile={profile} size="xl" />
          <div className="flex items-center gap-2">
            {isMe ? (
              <>
                <Link href="/settings" className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-semibold hover:bg-accent">
                  <Pencil className="size-4" /> Profili düzenle
                </Link>
                {me.is_founder && <ProfileUserMenu me={meLite} target={profile} />}
              </>
            ) : (
              <>
                <FollowButton meId={me.id} targetId={profile.id} initialFollowing={stats.isFollowing} disabled={me.is_suspended} />
                <ProfileUserMenu me={meLite} target={profile} />
              </>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-2xl font-bold tracking-tight">{profile.display_name || profile.username}</h1>
            {profile.is_verified && <VerifiedBadge />}
            {profile.is_founder && <FounderLabel />}
          </div>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        </div>

        {profile.is_suspended && <p className="mt-3 inline-block rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">Bu hesap askıya alınmış</p>}
        {profile.bio && <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">{profile.bio}</p>}

        <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-4" /> {joined} tarihinde katıldı
        </div>

        <div className="mt-3 flex gap-5 text-sm">
          <span><strong className="text-foreground">{formatCount(stats.following)}</strong> <span className="text-muted-foreground">Takip</span></span>
          <span><strong className="text-foreground">{profile.is_founder ? "1M" : formatCount(stats.followers)}</strong> <span className="text-muted-foreground">Takipçi</span></span>
        </div>
      </div>

      <div className="sticky top-0 z-10 flex border-b border-border bg-background/90 backdrop-blur">
        <Link href={`/profile/${profile.username}`} className={`flex-1 border-b-2 py-4 text-center text-sm font-semibold ${tab !== "videos" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>
          Gönderiler
        </Link>
        <Link href={`/profile/${profile.username}?tab=videos`} className={`flex-1 border-b-2 py-4 text-center text-sm font-semibold ${tab === "videos" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>
          Videolar
        </Link>
      </div>

      {tab === "videos" ? (
        <section className="border-b border-border px-4 py-5">
          <div className="mb-4 flex items-center gap-2">
            <Video className="size-5" />
            <div>
              <h2 className="font-bold">Videolar</h2>
              <p className="text-xs text-muted-foreground">Sağa-sola kaydırarak videolara bak</p>
            </div>
          </div>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {profileVideos.map((video) => (
              <article key={video.title} className="w-[82%] shrink-0 snap-center overflow-hidden rounded-2xl border border-border bg-card sm:w-[48%]">
                <div className="relative aspect-[9/14] bg-black">
                  <video className="h-full w-full object-cover" src={video.src} controls playsInline preload="metadata" />
                  <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-2 py-1 text-[11px] font-medium text-white">DEMO</div>
                  <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                    <Play className="size-3 fill-current" /> Video
                  </div>
                </div>
                <p className="p-3 text-sm font-medium">{video.title}</p>
              </article>
            ))}
          </div>
        </section>
      ) : posts.length === 0 ? (
        <p className="px-4 py-16 text-center text-sm text-muted-foreground">Henüz gönderi yok.</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} me={meLite} />)
      )}
    </div>
  )
}
