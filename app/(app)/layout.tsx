import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/config'
import { getCurrentProfile } from '@/lib/server-data'
import { SetupNotice } from '@/components/setup-notice'
import { AppShell } from '@/components/app-shell'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!isSupabaseConfigured) {
    return <SetupNotice />
  }

  const profile = await getCurrentProfile()
  if (!profile) {
    redirect('/auth/login')
  }

  return <AppShell profile={profile}>{children}</AppShell>
}
