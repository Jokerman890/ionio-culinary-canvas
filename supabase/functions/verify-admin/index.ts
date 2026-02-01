import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const allowedOrigins = ['https://ionio-ganderkesee.de', 'http://localhost:5173']
const defaultOrigin = allowedOrigins[0]

const resolveOrigin = (origin: string | null) =>
  origin && allowedOrigins.includes(origin) ? origin : defaultOrigin

const corsHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': resolveOrigin(origin),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  Vary: 'Origin',
})

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req.headers.get('Origin')) })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header')
      return new Response(
        JSON.stringify({ isAdmin: false, error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders(req.headers.get('Origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
    
    if (claimsError || !claimsData?.claims) {
      console.log('Failed to verify token:', claimsError?.message)
      return new Response(
        JSON.stringify({ isAdmin: false, error: 'Invalid token' }),
        {
          status: 401,
          headers: { ...corsHeaders(req.headers.get('Origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    const userId = claimsData.claims.sub
    console.log('Verifying admin status for user:', userId)

    // Use the has_role database function for consistent role checking
    const { data: hasAdminRole, error: roleError } = await supabase
      .rpc('has_role', { _user_id: userId, _role: 'admin' })

    if (roleError) {
      console.error('Error checking admin role:', roleError.message)
      return new Response(
        JSON.stringify({ isAdmin: false, error: 'Failed to verify role' }),
        {
          status: 500,
          headers: { ...corsHeaders(req.headers.get('Origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Admin verification result:', { userId, isAdmin: hasAdminRole })

    return new Response(
      JSON.stringify({ isAdmin: hasAdminRole === true, userId }),
      {
        status: 200,
        headers: { ...corsHeaders(req.headers.get('Origin')), 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ isAdmin: false, error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders(req.headers.get('Origin')), 'Content-Type': 'application/json' },
      }
    )
  }
})
