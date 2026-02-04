import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { getClientIp, sha256Hex } from '../_shared/rateLimit.ts'

// Server-side rate limiting via DB RPC (see migration).
// Environment requirements:
// - SUPABASE_URL
// - SUPABASE_ANON_KEY
// - SUPABASE_SERVICE_ROLE_KEY (for rate-limit bookkeeping only)

const WINDOW_SEC = 5 * 60
const LIMIT = 5

const json = (body: unknown, status: number, origin: string | null, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json', ...extraHeaders },
  })

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, origin)
  }

  const { email, password } = await req.json().catch(() => ({ email: null, password: null }))
  if (!email || !password) {
    return json({ error: 'Missing credentials' }, 400, origin)
  }

  // Rate-limit (server-side) BEFORE attempting auth.
  try {
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceKey) {
      // Fail safe: if misconfigured, refuse rather than run without protection.
      return json({ error: 'Service unavailable' }, 503, origin)
    }

    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey)

    const ip = getClientIp(req)
    const emailHash = await sha256Hex(String(email).trim().toLowerCase())

    const { data: count, error: rlError } = await supabaseAdmin
      .rpc('rl_login_attempt', { p_ip: ip, p_email_hash: emailHash, p_window_sec: WINDOW_SEC })

    if (rlError) {
      // Fail safe: don't leak details; refuse on RL failures.
      return json({ error: 'Service unavailable' }, 503, origin)
    }

    if (typeof count === 'number' && count > LIMIT) {
      const retryAfter = WINDOW_SEC
      return json(
        { error: 'Too many attempts. Please try again later.' },
        429,
        origin,
        { 'Retry-After': String(retryAfter) }
      )
    }
  } catch {
    return json({ error: 'Service unavailable' }, 503, origin)
  }

  // Proceed with normal auth via anon key.
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Avoid account enumeration; keep errors generic.
    return json({ error: 'Invalid credentials' }, 401, origin)
  }

  return json({ data }, 200, origin)
})
