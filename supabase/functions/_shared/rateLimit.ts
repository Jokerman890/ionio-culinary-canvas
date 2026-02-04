// Simple DB-backed rate limiting helper for Supabase Edge Functions.
// NOTE: needs DB function `rl_login_attempt` (see migration).

export type RateLimitResult = {
  allowed: boolean
  count: number
  limit: number
  retryAfterSec?: number
}

export const getClientIp = (req: Request): string => {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const cf = req.headers.get('cf-connecting-ip')
  if (cf) return cf.trim()
  return 'unknown'
}

export const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
