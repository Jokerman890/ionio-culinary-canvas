
-- Table to track login attempts for rate limiting
CREATE TABLE public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false
);

-- Index for fast lookups by identifier and time
CREATE INDEX idx_login_attempts_identifier_time ON public.login_attempts (identifier, attempted_at DESC);

-- Enable RLS (no public access needed, only service role)
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Function to check rate limit and record attempt
-- Returns JSON: { "allowed": true/false, "remaining": N, "retry_after_seconds": N }
CREATE OR REPLACE FUNCTION public.check_login_rate_limit(
  p_identifier text,
  p_max_attempts int DEFAULT 5,
  p_window_seconds int DEFAULT 300
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count int;
  window_start timestamptz;
  oldest_attempt timestamptz;
  result json;
BEGIN
  window_start := now() - (p_window_seconds || ' seconds')::interval;

  -- Count failed attempts in window
  SELECT count(*), min(attempted_at)
  INTO attempt_count, oldest_attempt
  FROM public.login_attempts
  WHERE identifier = p_identifier
    AND attempted_at > window_start
    AND success = false;

  IF attempt_count >= p_max_attempts THEN
    result := json_build_object(
      'allowed', false,
      'remaining', 0,
      'retry_after_seconds', EXTRACT(EPOCH FROM (oldest_attempt + (p_window_seconds || ' seconds')::interval - now()))::int
    );
  ELSE
    result := json_build_object(
      'allowed', true,
      'remaining', p_max_attempts - attempt_count,
      'retry_after_seconds', 0
    );
  END IF;

  RETURN result;
END;
$$;

-- Function to record a login attempt
CREATE OR REPLACE FUNCTION public.record_login_attempt(
  p_identifier text,
  p_success boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.login_attempts (identifier, success)
  VALUES (p_identifier, p_success);

  -- Clean up old entries (older than 1 hour) to prevent table bloat
  DELETE FROM public.login_attempts
  WHERE attempted_at < now() - interval '1 hour';
END;
$$;
