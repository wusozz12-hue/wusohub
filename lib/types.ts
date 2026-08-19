export type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  is_verified: boolean
  is_founder: boolean
  is_premium: boolean
  premium_until: string | null
  is_muted: boolean
  is_suspended: boolean
  is_disabled: boolean
  created_at: string
}

export type CurrentProfile = Profile & { email: string | null }

export type Post = {
  id: string
  user_id: string
  content: string | null
  media_url: string | null
  media_type: 'image' | 'video' | null
  like_count: number
  comment_count: number
  created_at: string
  author: Profile
  liked_by_me?: boolean
}

export type Comment = {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  author: Profile
}

export type Report = {
  id: string
  reporter_id: string
  target_type: 'post' | 'user'
  target_post_id: string | null
  target_user_id: string | null
  reason: string
  status: 'open' | 'reviewed' | 'resolved'
  created_at: string
  reporter?: Profile
  target_user?: Profile | null
}
