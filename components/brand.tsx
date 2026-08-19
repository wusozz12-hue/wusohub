import { BadgeCheck, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2 font-semibold', className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30">
        <span className="text-sm font-bold tracking-tight">W</span>
      </span>
      <span className="text-lg tracking-tight">
        Wuso<span className="text-primary">Hub</span>
      </span>
    </span>
  )
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <BadgeCheck
      aria-label="Onaylı hesap"
      className={cn('size-4 text-[var(--verified)]', className)}
    />
  )
}

export function PremiumLabel({ className }: { className?: string }) {
  return (
    <span
      aria-label="Premium"
      className={cn(
        'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold leading-none text-amber-500 ring-1 ring-amber-400/50',
        className,
      )}
    >
      <Star className="size-3 fill-current" />
      premium
    </span>
  )
}

export function FounderLabel({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'rounded px-1.5 py-0.5 text-[10px] font-semibold lowercase leading-none text-[var(--founder)] ring-1 ring-[var(--founder)]/40',
        className,
      )}
    >
      kurucu
    </span>
  )
}
