'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Search,
  PlusSquare,
  User as UserIcon,
  Settings,
  Shield,
  Flag,
  LogOut,
  AlertTriangle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand'
import { Avatar, UserName } from '@/components/user-bits'
import type { CurrentProfile } from '@/lib/types'

type NavItem = {
  href: string
  label: string
  icon: typeof Home
  active: (path: string) => boolean
}

export function AppShell({
  profile,
  children,
}: {
  profile: CurrentProfile
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const items: NavItem[] = [
    { href: '/', label: 'Akış', icon: Home, active: (p) => p === '/' },
    { href: '/search', label: 'Ara', icon: Search, active: (p) => p.startsWith('/search') },
    { href: '/create', label: 'Paylaş', icon: PlusSquare, active: (p) => p.startsWith('/create') },
    {
      href: `/profile/${profile.username}`,
      label: 'Profil',
      icon: UserIcon,
      active: (p) => p.startsWith('/profile'),
    },
    { href: '/settings', label: 'Ayarlar', icon: Settings, active: (p) => p.startsWith('/settings') },
  ]

  const founderItems: NavItem[] = profile.is_founder
    ? [
        { href: '/admin', label: 'Yönetim', icon: Shield, active: (p) => p.startsWith('/admin') },
        { href: '/reports', label: 'Raporlar', icon: Flag, active: (p) => p.startsWith('/reports') },
      ]
    : []

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  // Mobile bottom-nav uses a compact subset.
  const mobileItems = [
    items[0],
    items[1],
    items[2],
    ...(founderItems[0] ? [founderItems[0]] : []),
    items[3],
  ]

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-1 border-r border-border px-4 py-6 md:flex">
        <Link href="/" className="mb-4 px-2">
          <Logo />
        </Link>
        <nav className="flex flex-col gap-1">
          {[...items, ...founderItems].map((item) => (
            <NavLink key={item.href} item={item} active={item.active(pathname)} />
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <Link
            href={`/profile/${profile.username}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 transition-colors hover:bg-accent"
          >
            <Avatar profile={profile} size="sm" />
            <span className="min-w-0 flex-1">
              <UserName profile={profile} withLink={false} className="text-sm" />
              <span className="block truncate text-xs text-muted-foreground">
                @{profile.username}
              </span>
            </span>
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="size-5" />
            Çıkış yap
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/">
            <Logo />
          </Link>
          <button
            onClick={signOut}
            aria-label="Çıkış yap"
            className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="size-5" />
          </button>
        </header>

        {profile.is_suspended && (
          <div className="flex items-start gap-3 border-b border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              Hesabınız askıya alındı. İçerik paylaşamaz, yorum yapamaz,
              beğeni bırakamaz veya kullanıcı takip edemezsiniz. İçerikleri
              görüntülemeye devam edebilirsiniz.
            </p>
          </div>
        )}

        <main className="flex-1 pb-20 md:pb-8">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-border bg-background/90 px-2 py-2 backdrop-blur md:hidden">
        {mobileItems.map((item) => {
          const Icon = item.icon
          const active = item.active(pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px]',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      <Icon className="size-5" />
      {item.label}
    </Link>
  )
}
