import { createClient } from 'npm:@supabase/supabase-js@2.45.0'
import { corsHeaders } from '../_shared/cors.ts'

const json = (body: unknown, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
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

  // Use service role client for rate limit DB functions
  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Check rate limit (identifier = email, normalized to lowercase)
  const identifier = email.toLowerCase().trim()
  const { data: rateLimitResult, error: rlError } = await serviceClient
    .rpc('check_login_rate_limit', { p_identifier: identifier })

  if (rlError) {
    console.error('Rate limit check error:', rlError)
    // Fail open — allow login if rate limit check fails
  } else if (rateLimitResult && !rateLimitResult.allowed) {
    const retryAfter = Math.max(1, rateLimitResult.retry_after_seconds || 60)
    return json(
      { error: `Zu viele Anmeldeversuche. Bitte warten Sie ${Math.ceil(retryAfter / 60)} Minute(n).` },
      429,
      origin
    )
  }

  // Attempt authentication
  const anonClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  )
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password })

  if (error) {
    // Record failed attempt
    await serviceClient.rpc('record_login_attempt', {
      p_identifier: identifier,
      p_success: false,
    }).catch((e: unknown) => console.error('Failed to record attempt:', e))

    return json({ error: 'Invalid credentials' }, 401, origin)
  }

  // Record successful attempt (resets effective count since we only count failures)
  await serviceClient.rpc('record_login_attempt', {
    p_identifier: identifier,
    p_success: true,
  }).catch((e: unknown) => console.error('Failed to record attempt:', e))

  return json({ data }, 200, origin)
})
