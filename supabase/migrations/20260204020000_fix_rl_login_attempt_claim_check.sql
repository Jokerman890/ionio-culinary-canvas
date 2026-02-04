-- Fix: PostgREST claim access
-- The original function checked current_setting('request.jwt.claim.role'), which can be unset.
-- Use auth.jwt() instead.

create or replace function public.rl_login_attempt(
  p_ip text,
  p_email_hash text,
  p_window_sec integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz;
  v_count integer;
  v_role text;
begin
  v_role := coalesce(auth.jwt() ->> 'role', '');
  if v_role <> 'service_role' then
    raise exception 'forbidden';
  end if;

  v_window_start := date_trunc('second', now()) - make_interval(secs => (extract(epoch from now())::int % p_window_sec));

  insert into public.login_rate_limits(ip, email_hash, window_start, count)
  values (p_ip, p_email_hash, v_window_start, 1)
  on conflict (ip, email_hash, window_start)
  do update set count = login_rate_limits.count + 1
  returning count into v_count;

  return v_count;
end;
$$;
