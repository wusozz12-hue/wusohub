'use client'

import { useState } from 'react'
import { X, Loader2, Flag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function ReportDialog({
  open,
  onClose,
  reporterId,
  target,
}: {
  open: boolean
  onClose: () => void
  reporterId: string
  target:
    | { type: 'post'; postId: string }
    | { type: 'user'; userId: string; username: string }
}) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function submit() {
    if (!reason.trim()) {
      setError('Lütfen bir sebep belirtin.')
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.from('reports').insert({
      reporter_id: reporterId,
      target_type: target.type,
      target_post_id: target.type === 'post' ? target.postId : null,
      target_user_id: target.type === 'user' ? target.userId : null,
      reason: reason.trim(),
    })
    setLoading(false)
    if (error) {
      setError('Rapor gönderilemedi. Tekrar deneyin.')
      return
    }
    setSent(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Flag className="size-5 text-destructive" />
            {target.type === 'post' ? 'Gönderiyi bildir' : 'Kullanıcıyı bildir'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent"
          >
            <X className="size-4" />
          </button>
        </div>

        {sent ? (
          <div className="py-6 text-center">
            <p className="font-medium">Bildiriminiz alındı.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Kurucu ekibi en kısa sürede inceleyecektir.
            </p>
            <Button onClick={onClose} className="mt-4 h-9">
              Kapat
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              {target.type === 'user'
                ? `@${target.username} kullanıcısını neden bildiriyorsunuz?`
                : 'Bu gönderiyi neden bildiriyorsunuz?'}
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Sebebinizi yazın..."
              className="field-input mt-4 resize-none"
            />
            {error && (
              <p className="mt-2 text-sm text-destructive">{error}</p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose} className="h-9">
                İptal
              </Button>
              <Button onClick={submit} disabled={loading} className="h-9">
                {loading && <Loader2 className="size-4 animate-spin" />}
                Bildir
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
