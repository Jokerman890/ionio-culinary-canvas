export const allowedOrigins = [
  'https://ionio-ganderkesee.de',
  'https://www.ionio-ganderkesee.de',
  'https://ionio-culinary-canvas.vercel.app',
  'https://ionio-prime-web.lovable.app',
  'http://localhost:5173',
]

const isAllowedOrigin = (origin: string | null): boolean => {
  if (!origin) return false
  if (allowedOrigins.includes(origin)) return true
  return false
}

export const resolveOrigin = (origin: string | null) =>
  origin && isAllowedOrigin(origin) ? origin : allowedOrigins[0]

export const corsHeaders = (origin: string | null) => {
  const o = resolveOrigin(origin)
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  } as Record<string, string>
}
