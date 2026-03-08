
-- Analytics table for tracking page views
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  referrer text,
  user_agent text,
  device_type text DEFAULT 'desktop',
  browser text,
  country text,
  session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Public can insert (anonymous tracking)
CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admin/staff can read analytics
CREATE POLICY "Admin/Staff can view page views"
  ON public.page_views FOR SELECT
  TO authenticated
  USING (is_admin_or_staff(auth.uid()));

-- Index for common queries
CREATE INDEX idx_page_views_created_at ON public.page_views (created_at DESC);
CREATE INDEX idx_page_views_page_path ON public.page_views (page_path);
CREATE INDEX idx_page_views_session ON public.page_views (session_id);

-- Analytics summary view for fast dashboard queries
CREATE OR REPLACE FUNCTION public.get_analytics_summary(days_back integer DEFAULT 30)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result json;
BEGIN
  -- Check if user is admin/staff
  IF NOT is_admin_or_staff(auth.uid()) THEN
    RETURN '{"error": "unauthorized"}'::json;
  END IF;

  SELECT json_build_object(
    'total_views', (SELECT count(*) FROM page_views WHERE created_at >= now() - (days_back || ' days')::interval),
    'unique_sessions', (SELECT count(DISTINCT session_id) FROM page_views WHERE created_at >= now() - (days_back || ' days')::interval AND session_id IS NOT NULL),
    'today_views', (SELECT count(*) FROM page_views WHERE created_at >= CURRENT_DATE),
    'yesterday_views', (SELECT count(*) FROM page_views WHERE created_at >= CURRENT_DATE - interval '1 day' AND created_at < CURRENT_DATE),
    'top_pages', (
      SELECT json_agg(row_to_json(t)) FROM (
        SELECT page_path, count(*) as views
        FROM page_views
        WHERE created_at >= now() - (days_back || ' days')::interval
        GROUP BY page_path
        ORDER BY views DESC
        LIMIT 10
      ) t
    ),
    'daily_views', (
      SELECT json_agg(row_to_json(t)) FROM (
        SELECT date_trunc('day', created_at)::date as date, count(*) as views, count(DISTINCT session_id) as unique_visitors
        FROM page_views
        WHERE created_at >= now() - (days_back || ' days')::interval
        GROUP BY date_trunc('day', created_at)::date
        ORDER BY date ASC
      ) t
    ),
    'device_breakdown', (
      SELECT json_agg(row_to_json(t)) FROM (
        SELECT device_type, count(*) as views
        FROM page_views
        WHERE created_at >= now() - (days_back || ' days')::interval
        GROUP BY device_type
        ORDER BY views DESC
      ) t
    ),
    'browser_breakdown', (
      SELECT json_agg(row_to_json(t)) FROM (
        SELECT browser, count(*) as views
        FROM page_views
        WHERE created_at >= now() - (days_back || ' days')::interval AND browser IS NOT NULL
        GROUP BY browser
        ORDER BY views DESC
        LIMIT 5
      ) t
    ),
    'hourly_distribution', (
      SELECT json_agg(row_to_json(t)) FROM (
        SELECT extract(hour from created_at)::int as hour, count(*) as views
        FROM page_views
        WHERE created_at >= now() - (days_back || ' days')::interval
        GROUP BY extract(hour from created_at)::int
        ORDER BY hour
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$;
