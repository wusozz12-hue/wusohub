'use client'

import { useEffect, useState } from 'react'
import { Loader2, Send, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/format'
import { Avatar, UserName } from '@/components/user-bits'
import type { Comment } from '@/lib/types'

export function CommentSection({
  postId,
  me,
  onCountChange,
}: {
  postId: string
  me: { id: string; is_founder: boolean; is_suspended: boolean; username: string; display_name: string | null; avatar_url: string | null }
  onCountChange?: (delta: number) => void
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('comments')
        .select('*, author:profiles!comments_user_id_fkey(*)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      if (active) {
        setComments((data ?? []) as Comment[])
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [postId])

  async function addComment(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || me.is_suspended) return
    setSending(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: me.id, content: text.trim() })
      .select('*, author:profiles!comments_user_id_fkey(*)')
      .single()
    setSending(false)
    if (!error && data) {
      setComments((c) => [...c, data as Comment])
      setText('')
      onCountChange?.(1)
    }
  }

  async function remove(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('comments').delete().eq('id', id)
    if (!error) {
      setComments((c) => c.filter((x) => x.id !== id))
      onCountChange?.(-1)
    }
  }

  return (
    <div className="border-t border-border px-4 py-3">
      {!me.is_suspended && (
        <form onSubmit={addComment} className="flex items-center gap-2">
          <Avatar profile={me} size="sm" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Yorum yaz..."
            className="field-input flex-1"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            aria-label="Gönder"
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </form>
      )}

      <div className="mt-3 flex flex-col gap-3">
        {loading ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            Yorumlar yükleniyor...
          </p>
        ) : comments.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            Henüz yorum yok.
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <Avatar profile={c.author} size="sm" />
              <div className="min-w-0 flex-1 rounded-xl bg-secondary/60 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UserName profile={c.author} className="text-sm" />
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(c.created_at)}
                    </span>
                  </div>
                  {(me.is_founder || me.id === c.user_id) && (
                    <button
                      onClick={() => remove(c.id)}
                      aria-label="Yorumu sil"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-0.5 break-words text-sm text-foreground/90">
                  {c.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
