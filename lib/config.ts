// Founder / owner account. Only this email is the founder.
export const FOUNDER_EMAIL = 'wusozz12@gmail.com'

// Maximum allowed video size: 650 MB
export const MAX_VIDEO_BYTES = 650 * 1024 * 1024
export const MAX_VIDEO_MB = 650

// Maximum allowed image size: 10 MB
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
export const MAX_IMAGE_MB = 10

// Whether the Supabase environment variables are present.
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0
