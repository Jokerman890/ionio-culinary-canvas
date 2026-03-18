-- Add is_public column with default false
ALTER TABLE public.restaurant_settings ADD COLUMN is_public boolean NOT NULL DEFAULT false;

-- Mark known public settings as public
UPDATE public.restaurant_settings SET is_public = true WHERE key IN ('contact_phone', 'contact_email', 'contact_address', 'opening_hours', 'phone', 'address', 'email', 'hours');

-- Drop the old permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view settings" ON public.restaurant_settings;

-- Create new SELECT policy: public users see only is_public=true, admin/staff see all
CREATE POLICY "Anyone can view public settings" ON public.restaurant_settings
FOR SELECT USING (is_public = true OR is_admin_or_staff(auth.uid()));