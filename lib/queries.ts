import { createClient } from '@/lib/supabase/server'
import type { Post } from '@/lib/types'

const POST_SELECT = '*, author:profiles!posts_user_id_fkey(*)'

async function attachLikes(
  posts: any[],
  meId: string | null,
): Promise<Post[]> {
  if (!posts.length || !meId) {
    return posts.map((p) => ({ ...p, liked_by_me: false })) as Post[]
  }
  const supabase = await createClient()
  const ids = posts.map((p) => p.id)
  const { data: myLikes } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', meId)
    .in('post_id', ids)
  const liked = new Set((myLikes ?? []).map((l) => l.post_id))
  return posts.map((p) => ({ ...p, liked_by_me: liked.has(p.id) })) as Post[]
}

export async function getFeed(
  sort: 'new' | 'popular',
  meId: string | null,
): Promise<Post[]> {
  const supabase = await createClient()
  let query = supabase.from('posts').select(POST_SELECT)
  query =
    sort === 'popular'
      ? query
          .order('like_count', { ascending: false })
          .order('created_at', { ascending: false })
      : query.order('created_at', { ascending: false })

  const { data } = await query.limit(50)
  return attachLikes(data ?? [], meId)
}

export async function getPostsByUser(
  userId: string,
  meId: string | null,
): Promise<Post[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  return attachLikes(data ?? [], meId)
}

export async function getProfileByUsername(username: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .single()
  return data as import('@/lib/types').Profile | null
}

export async function getFollowStats(userId: string, meId: string | null) {
  const supabase = await createClient()
  const [{ count: followers }, { count: following }, mine] = await Promise.all([
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId),
    meId
      ? supabase
          .from('follows')
          .select('follower_id')
          .eq('follower_id', meId)
          .eq('following_id', userId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])
  return {
    followers: followers ?? 0,
    following: following ?? 0,
    isFollowing: !!(mine as { data: unknown }).data,
  }
}

export async function searchProfiles(term: string) {
  const supabase = await createClient()
  const clean = term.trim().replace(/[%_]/g, '')
  if (!clean) return [] as import('@/lib/types').Profile[]
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.ilike.%${clean}%,display_name.ilike.%${clean}%`)
    .limit(30)
  return (data ?? []) as import('@/lib/types').Profile[]
}
