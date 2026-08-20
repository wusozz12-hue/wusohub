"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Camera,
  Loader2,
  Check,
  LogOut,
  Sun,
  Moon,
  MessageSquareOff,
  Crown,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { MAX_IMAGE_BYTES, MAX_IMAGE_MB } from "@/lib/config"
import { Avatar } from "@/components/user-bits"
import { Button } from "@/components/ui/button"
import type { CurrentProfile } from "@/lib/types"

export function SettingsForm({ me }: { me: CurrentProfile }) {
  const router = useRouter()
  const avatarInput = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName] = useState(me.display_name ?? "")
  const [bio, setBio] = useState(me.bio ?? "")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(me.avatar_url)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(true)
  const [allowProfanity, setAllowProfanity] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("wusohub-theme")
    const savedProfanity = localStorage.getItem("wusohub-profanity")
    const isDark = savedTheme !== "light"
    const profanity = savedProfanity === "true"
    setDarkMode(isDark)
    setAllowProfanity(profanity)
    document.documentElement.classList.toggle("dark", isDark)
  }, [])

  function changeTheme(dark: boolean) {
    setDarkMode(dark)
    localStorage.setItem("wusohub-theme", dark ? "dark" : "light")
    document.documentElement.classList.toggle("dark", dark)
  }

  function changeProfanity(value: boolean) {
    setAllowProfanity(value)
    localStorage.setItem("wusohub-profanity", String(value))
  }

  function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setError(null)
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`Profil fotoğrafı en fazla ${MAX_IMAGE_MB} MB olabilir.`)
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function save() {
    setSaving(true)
    setSaved(false)
    setError(null)
    const supabase = createClient()
    try {
      let avatarUrl = me.avatar_url
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop() || "jpg"
        const path = `${me.id}/${crypto.randomUUID()}.${ext}`
        const { error: upErr } = await supabase.storage.from("avatars").upload(path, avatarFile, {
          upsert: false,
          contentType: avatarFile.type,
        })
        if (upErr) throw new Error(upErr.message)
        avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl
      }
      const { error: updErr } = await supabase.from("profiles").update({
        display_name: displayName.trim() || me.username,
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
      }).eq("id", me.id)
      if (updErr) throw new Error(updErr.message)
      setSaved(true)
      setAvatarFile(null)
      router.refresh()
    } catch {
      setError("Değişiklikler kaydedilemedi. Tekrar deneyin.")
    }
    setSaving(false)
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const previewProfile = {
    username: me.username,
    display_name: displayName || me.username,
    avatar_url: avatarPreview,
  }

  const premiumActive = Boolean(me.is_premium && (!me.premium_until || new Date(me.premium_until) > new Date()))

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <h1 className="font-serif text-2xl font-bold tracking-tight">Ayarlar</h1>
      <p className="mt-1 text-sm text-muted-foreground">Profil ve uygulama ayarlarını yönet.</p>

      <div className="mt-6 flex items-center gap-4">
        <button type="button" onClick={() => avatarInput.current?.click()} className="group relative rounded-full" aria-label="Profil fotoğrafı yükle">
          <Avatar profile={previewProfile} size="xl" />
          <span className="absolute inset-0 grid place-items-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="size-6 text-white" />
          </span>
        </button>
        <div>
          <p className="font-semibold">@{me.username}</p>
          <button type="button" onClick={() => avatarInput.current?.click()} className="mt-1 text-sm text-primary hover:underline">Fotoğrafı değiştir</button>
        </div>
      </div>

      <input ref={avatarInput} type="file" accept="image/*" hidden onChange={pickAvatar} />

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="displayName">Görünen ad</label>
          <input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} className="field-input" placeholder="Adınız" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="bio">Hakkında</label>
          <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={280} className="field-input resize-none" placeholder="Kendinden bahset..." />
          <p className="mt-1 text-right text-xs text-muted-foreground">{bio.length}/280</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-400/10 to-primary/10 p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-amber-400/15 text-amber-500">
            <Crown className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">Premium Yönetimi</h2>
            <p className="text-xs text-muted-foreground">
              {premiumActive ? "Premium üyeliğin aktif." : "Premium avantajlarını ve üyelik durumunu görüntüle."}
            </p>
          </div>
          <Link href="/premium" className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            {premiumActive ? "Görüntüle" : "Premium"}
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Uygulama ayarları</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="size-5" /> : <Sun className="size-5" />}
              <div><p className="text-sm font-medium">Tema</p><p className="text-xs text-muted-foreground">{darkMode ? "Koyu tema" : "Açık tema"}</p></div>
            </div>
            <button type="button" onClick={() => changeTheme(!darkMode)} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent">{darkMode ? "Açığa geç" : "Koyuya geç"}</button>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <MessageSquareOff className="size-5" />
              <div><p className="text-sm font-medium">Küfürlü yorumlar</p><p className="text-xs text-muted-foreground">Küfürlü yorumları görmeye izin ver</p></div>
            </div>
            <button type="button" onClick={() => changeProfanity(!allowProfanity)} className={allowProfanity ? "rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground" : "rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent"}>{allowProfanity ? "Açık" : "Kapalı"}</button>
          </div>
        </div>
      </div>

      {error && <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={save} disabled={saving} className="h-10">{saving && <Loader2 className="size-4 animate-spin" />}Kaydet</Button>
        {saved && <span className="inline-flex items-center gap-1 text-sm text-[var(--verified)]"><Check className="size-4" />Kaydedildi</span>}
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <button type="button" onClick={signOut} className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/40 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"><LogOut className="size-4" />Çıkış yap</button>
      </div>
    </div>
  )
}
