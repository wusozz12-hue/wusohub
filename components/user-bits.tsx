import Link from 'next/link'
import { cn } from '@/lib/utils'
import { VerifiedBadge, FounderLabel } from '@/components/brand'
import type { Profile } from '@/lib/types'

const SIZES = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
  xl: 'size-24 text-3xl',
}

export function Avatar({
  profile,
  size = 'md',
  className,
}: {
  profile: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>
  size?: keyof typeof SIZES
  className?: string
}) {
  const initial = (profile.display_name || profile.username || '?')
    .charAt(0)
    .toUpperCase()

  return (
    <span
      className={cn(
        'relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-secondary font-semibold text-silver ring-1 ring-border',
        SIZES[size],
        className,
      )}
    >
      {profile.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatar_url || '/placeholder.svg'}
          alt={`${profile.username} profil fotoğrafı`}
          className="size-full object-cover"
        />
      ) : (
        initial
      )}
    </span>
  )
}

export function UserName({
  profile,
  className,
  withLink = true,
  showHandle = false,
}: {
  profile: Pick<
    Profile,
    'username' | 'display_name' | 'is_verified' | 'is_founder'
  >
  className?: string
  withLink?: boolean
  showHandle?: boolean
}) {
  const name = profile.display_name || profile.username
  const inner = (
    <span className="inline-flex items-center gap-1.5">
      <span className="truncate font-semibold text-foreground">{name}</span>
      {profile.is_verified && <VerifiedBadge />}
      {profile.is_founder && <FounderLabel />}
    </span>
  )

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {withLink ? (
        <Link
          href={`/profile/${profile.username}`}
          className="hover:underline"
        >
          {inner}
        </Link>
      ) : (
        inner
      )}
      {showHandle && (
        <span className="truncate text-sm text-muted-foreground">
          @{profile.username}
        </span>
      )}
    </span>
  )
}
