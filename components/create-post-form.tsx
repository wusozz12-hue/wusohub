'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, Film, X, Loader2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  MAX_VIDEO_BYTES,
  MAX_VIDEO_MB,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MB,
} from '@/lib/config'
import { Avatar } from '@/components/user-bits'
import { Button } from '@/components/ui/button'
import type { CurrentProfile } from '@/lib/types'

type Selected = {
  file: File
  url: string
  type: 'image' | 'video'
}

export function CreatePostForm({ me }: { me: CurrentProfile }) {
  const router = useRouter()
  const imageInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)

  const [content, setContent] = useState('')
  const [media, setMedia] = useState<Selected | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  if (me.is_suspended) {
    return (
      <div className="mx-4 mt-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
        <AlertTriangle className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-semibold">Hesabınız askıya alındı</p>
          <p className="mt-1 text-sm">
            Askıya alınmış hesaplar gönderi paylaşamaz, görsel veya video
            yükleyemez. Bir hata olduğunu düşünüyorsanız kurucu ile iletişime
            geçin.
          </p>
        </div>
      </div>
    )
  }

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`Görsel en fazla ${MAX_IMAGE_MB} MB olabilir.`)
      return
    }
    if (media) URL.revokeObjectURL(media.url)
    setMedia({ file, url: URL.createObjectURL(file), type: 'image' })
  }

  function pickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    if (file.size > MAX_VIDEO_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(0)
      setError(
        `Video boyutu ${MAX_VIDEO_MB} MB sınırını aşıyor (${mb} MB). Lütfen daha küçük bir video seçin.`,
      )
      return
    }
    if (media) URL.revokeObjectURL(media.url)
    setMedia({ file, url: URL.createObjectURL(file), type: 'video' })
  }

  function clearMedia() {
    if (media) URL.revokeObjectURL(media.url)
    setMedia(null)
  }

  async function publish() {
    if (!content.trim() && !media) {
      setError('Bir metin yazın veya medya ekleyin.')
      return
    }
    setUploading(true)
    setError(null)
    const supabase = createClient()

    let mediaUrl: string | null = null
    let mediaType: 'image' | 'video' | null = null

    try {
      if (media) {
        const ext = media.file.name.split('.').pop() || 'bin'
        const path = `${me.id}/${crypto.randomUUID()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('media')
          .upload(path, media.file, {
            cacheControl: '3600',
            upsert: false,
            contentType: media.file.type,
          })
        if (upErr) {
          throw new Error(upErr.message)
        }
        mediaUrl = supabase.storage.from('media').getPublicUrl(path).data
          .publicUrl
        mediaType = media.type
      }

      const { error: insErr } = await supabase.from('posts').insert({
        user_id: me.id,
        content: content.trim() || null,
        media_url: mediaUrl,
        media_type: mediaType,
      })
      if (insErr) throw new Error(insErr.message)

      clearMedia()
      setContent('')
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(
        'Gönderi paylaşılamadı. Depolama ve bağlantı ayarlarını kontrol edin.',
      )
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="text-xl font-bold">Yeni gönderi</h1>

      <div className="mt-4 flex gap-3">
        <Avatar profile={me} size="md" />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="Neler oluyor?"
          className="field-input flex-1 resize-none text-[15px]"
        />
      </div>

      {media && (
        <div className="relative mt-4 overflow-hidden rounded-xl border border-border">
          <button
            onClick={clearMedia}
            aria-label="Medyayı kaldır"
            className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-lg bg-black/60 text-white hover:bg-black/80"
          >
            <X className="size-4" />
          </button>
          {media.type === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.url || '/placeholder.svg'}
              alt="Seçilen görsel önizlemesi"
              className="max-h-[420px] w-full object-cover"
            />
          ) : (
            <video src={media.url} controls className="max-h-[420px] w-full bg-black" />
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <input
        ref={imageInput}
        type="file"
        accept="image/*"
        hidden
        onChange={pickImage}
      />
      <input
        ref={videoInput}
        type="file"
        accept="video/*"
        hidden
        onChange={pickVideo}
      />

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9"
            onClick={() => imageInput.current?.click()}
            disabled={uploading}
          >
            <ImagePlus className="size-4" />
            Görsel
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9"
            onClick={() => videoInput.current?.click()}
            disabled={uploading}
          >
            <Film className="size-4" />
            Video
          </Button>
        </div>
        <Button onClick={publish} disabled={uploading} className="h-9">
          {uploading && <Loader2 className="size-4 animate-spin" />}
          {uploading ? 'Yükleniyor...' : 'Paylaş'}
        </Button>
      </div>

      {uploading && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Video boyutu en fazla {MAX_VIDEO_MB} MB, görseller en fazla{' '}
        {MAX_IMAGE_MB} MB olabilir.
      </p>
    </div>
  )
}
