import Link from "next/link"
import { redirect } from "next/navigation"
import { Star } from "lucide-react"
import { getCurrentProfile } from "@/lib/server-data"
import { SettingsForm } from "@/components/settings-form"

export default async function SettingsPage() {
  const me = await getCurrentProfile()
  if (!me) redirect("/auth/login")

  return (
    <>
      <SettingsForm me={me} />

      <div className="mx-auto w-full max-w-xl px-4 pb-8">
        <Link
          href="/premium"
          className="flex items-center gap-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 transition-colors hover:bg-amber-400/15"
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-400/20 text-amber-500">
            <Star className="size-5 fill-current" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Premium Yönetimi</p>
            <p className="text-sm text-muted-foreground">
              Premium durumunu, avantajlarını ve üyelik sayfasını görüntüle.
            </p>
          </div>
          <span className="text-sm font-medium text-amber-500">Görüntüle</span>
        </Link>
      </div>
    </>
  )
}
