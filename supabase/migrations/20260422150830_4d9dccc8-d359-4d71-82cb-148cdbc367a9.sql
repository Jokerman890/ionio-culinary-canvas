
-- Remove public listing of gallery bucket objects
DROP POLICY IF EXISTS "Anyone can view gallery images" ON storage.objects;

-- Replace overly permissive page_views INSERT policy with a validated one
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;

CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
TO anon, authenticated
WITH CHECK (
  page_path IS NOT NULL
  AND length(page_path) BETWEEN 1 AND 512
  AND (user_agent IS NULL OR length(user_agent) <= 1024)
  AND (referrer IS NULL OR length(referrer) <= 2048)
);
