
-- 1) Add explicit admin-only SELECT policy on login_attempts so RLS intent is explicit.
-- Writes happen via service role (edge function), which bypasses RLS.
CREATE POLICY "Admins can view login attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2) Restrict listing of objects in the public 'gallery' bucket to admin/staff.
-- Individual files remain publicly readable via their public URL (bucket is public),
-- but anonymous clients can no longer enumerate the bucket via storage.objects SELECT.
DROP POLICY IF EXISTS "Public gallery read" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public can view gallery objects" ON storage.objects;
DROP POLICY IF EXISTS "Gallery objects are publicly accessible" ON storage.objects;

CREATE POLICY "Admin/Staff can list gallery objects"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'gallery' AND is_admin_or_staff(auth.uid()));
