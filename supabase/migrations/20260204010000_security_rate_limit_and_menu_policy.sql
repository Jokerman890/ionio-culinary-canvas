-- P0 hardening: server-side login rate limiting + tighten public menu_items read

-- 1) Rate limiting table
CREATE TABLE IF NOT EXISTS public.login_rate_limits (
  ip TEXT NOT NULL,
  email_hash TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (ip, email_hash, window_start)
);

-- Only service role should touch this table (Edge Function uses service key)
ALTER TABLE public.login_rate_limits ENABLE ROW LEVEL SECURITY;

-- No public access by default
REVOKE ALL ON TABLE public.login_rate_limits FROM anon, authenticated;

-- 2) Security definer RPC for incrementing login attempts
CREATE OR REPLACE FUNCTION public.rl_login_attempt(
  p_ip TEXT,
  p_email_hash TEXT,
  p_window_sec INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INTEGER;
  v_role TEXT;
BEGIN
  v_role := current_setting('request.jwt.claim.role', true);
  IF v_role IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  v_window_start := to_timestamp(floor(extract(epoch from now()) / p_window_sec) * p_window_sec);

  INSERT INTO public.login_rate_limits (ip, email_hash, window_start, count)
  VALUES (p_ip, p_email_hash, v_window_start, 1)
  ON CONFLICT (ip, email_hash, window_start)
  DO UPDATE SET count = public.login_rate_limits.count + 1, updated_at = now()
  RETURNING count INTO v_count;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.rl_login_attempt(TEXT, TEXT, INTEGER) FROM anon, authenticated;

-- 3) Tighten public menu_items select policy to available items only
DROP POLICY IF EXISTS "Anyone can view available menu items" ON public.menu_items;

CREATE POLICY "Anyone can view available menu items"
  ON public.menu_items FOR SELECT
  USING (
    is_available = true
    OR public.is_admin_or_staff(auth.uid())
  );
