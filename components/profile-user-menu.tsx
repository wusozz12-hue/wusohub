"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Flag, BadgeCheck, Ban, VolumeX, Power, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ReportDialog } from "@/components/report-dialog"
import type { Profile } from "@/lib/types"

type Me = {
  id: string
  is_founder: boolean
}

export function ProfileUserMenu({ me, target }: { me: Me; target: Profile }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  async function moderate(patch: Partial<Profile>, action: string, detail: string) {
    setBusy(action)
    const supabase = createClient()
    const { error } = await supabase.from("profiles").update(patch).eq("id", target.id)
    if (!error) {
      await supabase.from("moderation_actions").insert({
        admin_id: me.id,
        target_user_id: target.id,
        action,
        detail,
      })
      router.refresh()
    }
    setBusy(null)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Kullanıcı menüsü"
        className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground hover:bg-accent"
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-20 w-56 overflow-hidden rounded-xl border border-border bg-popover py-1 shadow-xl">
            <button
              onClick={() => {
                setOpen(false)
                setReportOpen(true)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
            >
              <Flag className="size-4" />
              Kullanıcıyı bildir
            </button>

            {me.is_founder && (
              <>
                <div className="my-1 border-t border-border" />
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--founder)]">
                  Kurucu işlemleri
                </p>
                <MenuAction
                  busy={busy === "verify"}
                  icon={<BadgeCheck className="size-4" />}
                  label={target.is_verified ? "Onayı kaldır" : "Hesabı onayla"}
                  onClick={() =>
                    moderate(
                      { is_verified: !target.is_verified },
                      "verify",
                      target.is_verified ? "Onay kaldırıldı" : "Onaylandı",
                    )
                  }
                />
                <MenuAction
                  busy={busy === "mute"}
                  icon={<VolumeX className="size-4" />}
                  label={target.is_muted ? "Susturmayı kaldır" : "Sustur"}
                  onClick={() =>
                    moderate(
                      { is_muted: !target.is_muted },
                      "mute",
                      target.is_muted ? "Susturma kaldırıldı" : "Susturuldu",
                    )
                  }
                />
                <MenuAction
                  busy={busy === "suspend"}
                  danger
                  icon={<Ban className="size-4" />}
                  label={target.is_suspended ? "Askıyı kaldır" : "Askıya al"}
                  onClick={() =>
                    moderate(
                      { is_suspended: !target.is_suspended },
                      "suspend",
                      target.is_suspended ? "Askı kaldırıldı" : "Askıya alındı",
                    )
                  }
                />
                <MenuAction
                  busy={busy === "disable"}
                  danger
                  icon={<Power className="size-4" />}
                  label={target.is_disabled ? "Hesabı etkinleştir" : "Hesabı devre dışı bırak"}
                  onClick={() =>
                    moderate(
                      { is_disabled: !target.is_disabled },
                      "disable",
                      target.is_disabled ? "Etkinleştirildi" : "Devre dışı bırakıldı",
                    )
                  }
                />
              </>
            )}
          </div>
        </>
      )}

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        reporterId={me.id}
        target={{ type: "user", userId: target.id, username: target.username }}
      />
    </div>
  )
}

function MenuAction({
  icon,
  label,
  onClick,
  busy,
  danger,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  busy?: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent disabled:opacity-50 ${
        danger ? "text-destructive" : ""
      }`}
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : icon}
      {label}
    </button>
  )
}
