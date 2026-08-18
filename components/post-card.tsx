'use client'

import { useState } from 'react'
import { Heart, MessageCircle, MoreHorizontal, Trash2, Flag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { timeAgo, formatCount } from '@/lib/format'
import { Avatar, UserName } from '@/components/user-bits'
import { CommentSection } from '@/components/comment-section'
import { ReportDialog } from '@/components/report-dialog'
import type { Post } from '@/lib/types'

type Me = {
  id: string
  is_founder: boolean
  is_suspended: boolean
  username: string
  display_name: string | null
  avatar_url: string | null
}

export function PostCard({ post, me }: { post: Post; me: Me }) {
  const [liked, setLiked] = useState(!!post.liked_by_me)
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [commentCount, setCommentCount] = useState(post.comment_count)
  const [showComments, setShowComments] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [busy, setBusy] = useState(false)

  const canDelete = me.is_founder || me.id === post.user_id

  async function toggleLike() {
    if (me.is_suspended || busy) return
    setBusy(true)
    const supabase = createClient()
    const next = !liked
    // optimistic
    setLiked(next)
    setLikeCount((c) => c + (next ? 1 : -1))
    const { error } = next
      ? await supabase.from('likes').insert({ post_id: post.id, user_id: me.id })
      : await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', me.id)
    if (error) {
      // revert
      setLiked(!next)
      setLikeCount((c) => c + (next ? -1 : 1))
    }
    setBusy(false)
  }

  async function deletePost() {
    setMenuOpen(false)
    const supabase = createClient()
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (!error) setDeleted(true)
  }

  if (deleted) return null

  return (
    <article className="border-b border-border px-4 py-4">
      <div className="flex gap-3">
        <Avatar profile={post.author} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-2">
              <UserName profile={post.author} />
              <span className="text-sm text-muted-foreground">
                @{post.author.username} · {timeAgo(post.created_at)}
              </span>
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Gönderi menüsü"
                className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent"
              >
                <MoreHorizontal className="size-4" />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-border bg-popover py-1 shadow-xl">
                    {canDelete && (
                      <button
                        onClick={deletePost}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent"
                      >
                        <Trash2 className="size-4" />
                        Gönderiyi sil
                      </button>
                    )}
                    {me.id !== post.user_id && (
                      <button
                        onClick={() => {
                          setMenuOpen(false)
                          setReportOpen(true)
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                      >
                        <Flag className="size-4" />
                        Bildir
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {post.content && (
            <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground/90">
              {post.content}
            </p>
          )}

          {post.media_url && post.media_type === 'image' && (
            <div className="mt-3 overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.media_url || '/placeholder.svg'}
                alt="Gönderi görseli"
                className="max-h-[520px] w-full object-cover"
              />
            </div>
          )}

          {post.media_url && post.media_type === 'video' && (
            <div className="mt-3 overflow-hidden rounded-xl border border-border">
              <video
                src={post.media_url}
                controls
                className="max-h-[520px] w-full bg-black"
              />
            </div>
          )}

          <div className="mt-3 flex items-center gap-6">
            <button
              onClick={toggleLike}
              disabled={me.is_suspended}
              className={cn(
                'flex items-center gap-1.5 text-sm transition-colors disabled:opacity-50',
                liked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive',
              )}
            >
              <Heart className={cn('size-5', liked && 'fill-current')} />
              {formatCount(likeCount)}
            </button>
            <button
              onClick={() => setShowComments((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <MessageCircle className="size-5" />
              {formatCount(commentCount)}
            </button>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="mt-3">
          <CommentSection
            postId={post.id}
            me={me}
            onCountChange={(d) => setCommentCount((c) => Math.max(0, c + d))}
          />
        </div>
      )}

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        reporterId={me.id}
        target={{ type: 'post', postId: post.id }}
      />
    </article>
  )
}
