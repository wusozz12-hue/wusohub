"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Camera,
  Loader2,
  Check,
  LogOut,
  Moon,
  Sun,
  Monitor,
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    me.avatar_url,
  )
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [theme, setTheme] = useState("system")
  const [allowProfanity, setAllowProfanity] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("wusohub-theme") || "system"
    const savedProfanity =
      localStorage.getItem("wusohub-allow-profanity") === "true"

    setTheme(savedTheme)
    setAllowProfanity(savedProfanity)

    applyTheme(savedTheme)
  }, [])

  function applyTheme(value: string) {
    const root = document.documentElement

    if (value === "dark") {
      root.classList.add("dark")
    } else if (value === "light") {
      root.classList.remove("dark")
    } else {
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches

      if (dark) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }
  }

  function changeTheme(value: string) {
    setTheme(value)
    localStorage.setItem("wusohub-theme", value)
    applyTheme(value)
  }

  function changeProfanity(value: boolean) {
    setAllowProfanity(value)
    localStorage.setItem("wusohub-allow-profanity", String(value))
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

        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, {
            upsert: false,
            contentType: avatarFile.type,
          })

        if (upErr) throw new Error(upErr.message)

        avatarUrl = supabase.storage
          .from("avatars")
          .getPublicUrl(path).data.publicUrl
      }

      const { error: updErr } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim() || me.username,
          bio: bio.trim() || null,
          avatar_url: avatarUrl,
        })
        .eq("id", me.id)

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

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <h1 className="font-serif text-2xl font-bold tracking-tight">
        Ayarlar
      </h1>

      <p className="mt-1 text-sm text-muted-foreground">
        Hesabını ve uygulama tercihlerini yönet.
      </p>

      {/* Profil */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Profil</h2>

        <div className="mt-5 flex items-center gap-4">
          <button
            type="button"
            onClick={() => avatarInput.current?.click()}
            className="group relative rounded-full"
            aria-label="Profil fotoğrafı yükle"
          >
            <Avatar profile={previewProfile} size="xl" />

            <span className="absolute inset-0 grid place-items-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-6 text-white" />
            </span>
          </button>

          <div>
            <p className="font-semibold">@{me.username}</p>

            <button
              type="button"
              onClick={() => avatarInput.current?.click()}
              className="mt-1 text-sm text-primary hover:underline"
            >
              Fotoğrafı değiştir
            </button>
          </div>
        </div>

        <input
          ref={avatarInput}
          type="file"
          accept="image/*"
          hidden
          onChange={pickAvatar}
        />

        <div className="mt-6 space-y-4">
          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              htmlFor="displayName"
            >
              Görünen ad
            </label>

            <input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              className="field-input"
              placeholder="Adınız"
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              htmlFor="bio"
            >
              Hakkında
            </label>

            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={280}
              className="field-input resize-none"
              placeholder="Kendinden bahset..."
            />

            <p className="mt-1 text-right text-xs text-muted-foreground">
              {bio.length}/280
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={save} disabled={saving} className="h-10">
            {saving && <Loader2 className="size-4 animate-spin" />}
            Kaydet
          </Button>

          {saved && (
            <span className="inline-flex items-center gap-1 text-sm text-[var(--verified)]">
              <Check className="size-4" />
              Kaydedildi
            </span>
          )}
        </div>
      </section>

      {/* Tema */}
      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Tema</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          WusoHub görünümünü seç.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => changeTheme("light")}
            className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-sm transition-colors ${
              theme === "light"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-accent"
            }`}
          >
            <Sun className="size-5" />
            Açık
          </button>

          <button
            type="button"
            onClick={() => changeTheme("dark")}
            className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-sm transition-colors ${
              theme === "dark"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-accent"
            }`}
          >
            <Moon className="size-5" />
            Koyu
          </button>

          <button
            type="button"
            onClick={() => changeTheme("system")}
            className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-sm transition-colors ${
              theme === "system"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-accent"
            }`}
          >
            <Monitor className="size-5" />
            Sistem
          </button>
        </div>
      </section>

      {/* Küfürlü yorumlar */}
      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Küfürlü yorumlar</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Küfürlü yorumların gösterilmesine izin ver.
            </p>
          </div>

          <button
            type="button"
            onClick={() => changeProfanity(!allowProfanity)}
            aria-label="Küfürlü yorumları aç veya kapat"
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              allowProfanity ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-1 size-5 rounded-full bg-white shadow transition-transform ${
                allowProfanity ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          {allowProfanity
            ? "Küfürlü yorumlar gösteriliyor."
            : "Küfürlü yorumlar gizleniyor."}
        </p>
      </section>

      {/* Çıkış */}
      <section className="mt-4 rounded-2xl border border-destructive/30 bg-card p-5">
        <h2 className="font-semibold">Hesap</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          WusoHub hesabından çıkış yap.
        </p>

        <Button
          type="button"
          variant="destructive"
          onClick={signOut}
          className="mt-4"
        >
          <LogOut className="size-4" />
          Çıkış yap
        </Button>
      </section>
    </div>
  )
}
