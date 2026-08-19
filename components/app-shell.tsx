'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Home,
  Search,
  PlusSquare,
  User as UserIcon,
  Settings,
  Flag,
  LogOut,
  AlertTriangle,
  Languages,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand'
import { Avatar, UserName } from '@/components/user-bits'
import type { CurrentProfile } from '@/lib/types'

type Language = 'tr' | 'en'

type NavItem = {
  href: string
  label: string
  icon: typeof Home
  active: (path: string) => boolean
}

const translations = {
  tr: {
    feed: 'Akış',
    search: 'Ara',
    share: 'Paylaş',
    profile: 'Profil',
    settings: 'Ayarlar',
    reports: 'Raporlar',
    logout: 'Çıkış yap',
    language: 'Dil',
    suspended:
      'Hesabınız askıya alındı. İçerik paylaşamaz, yorum yapamaz, beğeni bırakamaz veya kullanıcı takip edemezsiniz. İçerikleri görüntülemeye devam edebilirsiniz.',
  },
  en: {
    feed: 'Feed',
    search: 'Search',
    share: 'Share',
    profile: 'Profile',
    settings: 'Settings',
    reports: 'Reports',
    logout: 'Log out',
    language: 'Language',
    suspended:
      'Your account has been suspended. You cannot post, comment, like, or follow users. You can continue viewing content.',
  },
} as const

export function AppShell({
  profile,
  children,
}: {
  profile: CurrentProfile
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [language, setLanguage] = useState<Language>('tr')

  useEffect(() => {
    const saved = window.localStorage.getItem('wusohub-language')
    if (saved === 'en' || saved === 'tr') setLanguage(saved)
  }, [])

  function changeLanguage(next: Language) {
    setLanguage(next)
    window.localStorage.setItem('wusohub-language', next)
  }

  const t = translations[language]

  const items: NavItem[] = [
    { href: '/', label: t.feed, icon: Home, active: (p) => p === '/' },
    {
      href: '/search',
      label: t.search,
      icon: Search,
      active: (p) => p.startsWith('/search'),
    },
    {
      href: '/create',
      label: t.share,
      icon: PlusSquare,
      active: (p) => p.startsWith('/create'),
    },
    {
      href: `/profile/${profile.username}`,
      label: t.profile,
      icon: UserIcon,
      active: (p) => p.startsWith('/profile'),
    },
    {
      href: '/settings',
      label: t.settings,
      icon: Settings,
      active: (p) => p.startsWith('/settings'),
    },
  ]

  const founderItems: NavItem[] = profile.is_founder
    ? [{ href: '/reports', label: t.reports, icon: Flag, active: (p) => p.startsWith('/reports') }]
    : []

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const mobileItems = [
    items[0],
    items[1],
    items[2],
    ...(founderItems[0] ? [founderItems[0]] : []),
    items[3],
  ]

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl">
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
          <LanguageSelector language={language} label={t.language} onChange={changeLanguage} />

          <Link
            href={`/profile/${profile.username}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 transition-colors hover:bg-accent"
          >
            <Avatar profile={profile} size="sm" />
            <span className="min-w-0 flex-1">
              <UserName profile={profile} withLink={false} className="text-sm" />
              <span className="block truncate text-xs text-muted-foreground">@{profile.username}</span>
            </span>
          </Link>

          <button
            onClick={signOut}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="size-5" />
            {t.logout}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-1">
            <LanguageSelector language={language} label={t.language} onChange={changeLanguage} compact />
            <button onClick={signOut} aria-label={t.logout} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
              <LogOut className="size-5" />
            </button>
          </div>
        </header>

        {profile.is_suspended && (
          <div className="flex items-start gap-3 border-b border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>{t.suspended}</p>
          </div>
        )}

        <main className="flex-1 pb-20 md:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-border bg-background/90 px-2 py-2 backdrop-blur md:hidden">
        {mobileItems.map((item) => {
          const Icon = item.icon
          const active = item.active(pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px]', active ? 'text-primary' : 'text-muted-foreground')}
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

function LanguageSelector({
  language,
  label,
  onChange,
  compact = false,
}: {
  language: Language
  label: string
  onChange: (language: Language) => void
  compact?: boolean
}) {
  return (
    <label className={cn('flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm', compact && 'px-2')}>
      <Languages className="size-4 shrink-0 text-muted-foreground" />
      {!compact && <span className="text-muted-foreground">{label}</span>}
      <select
        value={language}
        onChange={(event) => onChange(event.target.value as Language)}
        aria-label={label}
        className="bg-transparent font-medium outline-none"
      >
        <option value="tr">Türkçe</option>
        <option value="en">English</option>
      </select>
    </label>
  )
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
        active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      <Icon className="size-5" />
      {item.label}
    </Link>
  )
}
