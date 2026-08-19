import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { CalendarDays, Pencil } from "lucide-react"
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

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const me = await getCurrentProfile()

  if (!me) {
    redirect("/auth/login")
  }

  const { username } = await params
  const profile = await getProfileByUsername(username)

  if (!profile) {
    notFound()
  }

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
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-semibold hover:bg-accent"
                >
                  <Pencil className="size-4" />
                  Profili düzenle
                </Link>

                {me.is_founder && (
                  <ProfileUserMenu me={meLite} target={profile} />
                )}
              </>
            ) : (
              <>
                <FollowButton
                  meId={me.id}
                  targetId={profile.id}
                  initialFollowing={stats.isFollowing}
                  disabled={me.is_suspended}
                />

                <ProfileUserMenu
                  me={meLite}
                  target={profile}
                />
              </>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-2xl font-bold tracking-tight">
              {profile.display_name || profile.username}
            </h1>

            {profile.is_verified && <VerifiedBadge />}
            {profile.is_founder && <FounderLabel />}
          </div>

          <p className="text-sm text-muted-foreground">
            @{profile.username}
          </p>
        </div>

        {profile.is_suspended && (
          <p className="mt-3 inline-block rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
            Bu hesap askıya alınmış
          </p>
        )}

        {profile.bio && (
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
            {profile.bio}
          </p>
        )}

        <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          {joined} tarihinde katıldı
        </div>

        <div className="mt-3 flex gap-5 text-sm">
          <span>
            <strong className="text-foreground">
              {formatCount(stats.following)}
            </strong>{" "}
            <span className="text-muted-foreground">Takip</span>
          </span>

          <span>
            <strong className="text-foreground">
              {formatCount(stats.followers)}
            </strong>{" "}
            <span className="text-muted-foreground">Takipçi</span>
          </span>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="px-4 py-16 text-center text-sm text-muted-foreground">
          Henüz gönderi yok.
        </p>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} me={meLite} />
        ))
      )}
    </div>
  )
}
```
