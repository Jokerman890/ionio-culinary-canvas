import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const allowedOrigins = ['https://ionio-ganderkesee.de', 'http://localhost:5173']
const defaultOrigin = allowedOrigins[0]

const resolveOrigin = (origin: string | null) =>
    origin && allowedOrigins.includes(origin) ? origin : defaultOrigin

const corsHeaders = (origin: string | null) => ({
    'Access-Control-Allow-Origin': resolveOrigin(origin),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
})

const MAX_ATTEMPTS = 5
const WINDOW_MS = 5 * 60 * 1000

const getClientIp = (req: Request) =>
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

const buildRateLimitKey = (email: string, ip: string) =>
    `login:${email.toLowerCase()}:${ip}`

const rateLimitResponse = (origin: string | null, retryAfterMs: number) =>
    new Response(
        JSON.stringify({
            error: 'rate_limited',
            message: 'Zu viele Anmeldeversuche. Bitte später erneut versuchen.',
            retryAfterMs,
        }),
        {
            status: 429,
            headers: {
                ...corsHeaders(origin),
                'Content-Type': 'application/json',
                'Retry-After': Math.ceil(retryAfterMs / 1000).toString(),
            },
        }
    )

Deno.serve(async (req) => {
    const origin = req.headers.get('Origin')

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders(origin) })
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
        })
    }

    try {
        const { email, password } = await req.json().catch(() => ({ email: null, password: null }))

        if (!email || !password) {
            return new Response(JSON.stringify({ error: 'Missing credentials' }), {
                status: 400,
                headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
            })
        }

        const ip = getClientIp(req)
        const key = buildRateLimitKey(email, ip)
        const kv = await Deno.openKv()

        const now = Date.now()
        const entry = await kv.get<{ count: number; firstAttemptAt: number }>([key])

        if (entry.value) {
            const elapsed = now - entry.value.firstAttemptAt
            if (elapsed < WINDOW_MS && entry.value.count >= MAX_ATTEMPTS) {
                const retryAfter = WINDOW_MS - elapsed
                return rateLimitResponse(origin, retryAfter)
            }

            if (elapsed >= WINDOW_MS) {
                await kv.delete([key])
            }
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!
        )

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            const base = entry.value && now - entry.value.firstAttemptAt < WINDOW_MS
                ? entry.value
                : { count: 0, firstAttemptAt: now }

            const next = { count: base.count + 1, firstAttemptAt: base.firstAttemptAt }
            await kv.set([key], next, { expireIn: WINDOW_MS })

            if (next.count >= MAX_ATTEMPTS) {
                return rateLimitResponse(origin, WINDOW_MS)
            }

            return new Response(JSON.stringify({ error: error.message }), {
                status: 401,
                headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
            })
        }

        await kv.delete([key])

        return new Response(JSON.stringify({ data }), {
            status: 200,
            headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
        })
    } catch (err) {
        console.error('Unexpected error in login-rate-limited:', err)
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
        })
    }
})