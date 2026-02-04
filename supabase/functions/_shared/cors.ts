export const allowedOrigins = [
  // Production domains
  'https://ionio-ganderkesee.de',
  'https://ionio-culinary-canvas.vercel.app',

  // Local dev
  'http://localhost:5173',
]

export const resolveOrigin = (origin: string | null) =>
  origin && allowedOrigins.includes(origin) ? origin : 'https://ionio-ganderkesee.de'

export const corsHeaders = (origin: string | null) => {
  const o = resolveOrigin(origin)
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  } as Record<string, string>
}
