"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, UserCheck, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

export function FollowButton({
  meId,
  targetId,
  initialFollowing,
  disabled,
}: {
  meId: string
  targetId: string
  initialFollowing: boolean
  disabled?: boolean
}) {
  const router = useRouter()
  const [following, setFollowing] = useState(initialFollowing)
  const [busy, setBusy] = useState(false)

  async function toggle() {
    if (busy || disabled) return
    setBusy(true)
    const supabase = createClient()
    const next = !following
    setFollowing(next)
    const { error } = next
      ? await supabase.from("follows").insert({ follower_id: meId, following_id: targetId })
      : await supabase.from("follows").delete().eq("follower_id", meId).eq("following_id", targetId)
    if (error) {
      setFollowing(!next)
    } else {
      router.refresh()
    }
    setBusy(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={busy || disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50",
        following
          ? "border border-border bg-transparent text-foreground hover:border-destructive/50 hover:text-destructive"
          : "bg-primary text-primary-foreground hover:bg-primary/90",
      )}
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : following ? (
        <UserCheck className="size-4" />
      ) : (
        <UserPlus className="size-4" />
      )}
      {following ? "Takiptesin" : "Takip et"}
    </button>
  )
}
