import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Note: Server-side rate limiting via Deno KV is not available in Supabase Edge Functions.
// Rate limiting is implemented client-side as a UX measure. For production-grade rate limiting,
// consider using Supabase's built-in rate limiting or an external service like Redis.

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    try {
        const { email, password } = await req.json().catch(() => ({ email: null, password: null }))

        if (!email || !password) {
            return new Response(JSON.stringify({ error: 'Missing credentials' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!
        )

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            console.log('Login failed for:', email, '- Reason:', error.message)
            return new Response(JSON.stringify({ error: error.message }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        console.log('Login successful for:', email)
        return new Response(JSON.stringify({ data }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (err) {
        console.error('Unexpected error in login-rate-limited:', err)
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
