-- Fix: Allow authenticated users to read their OWN role from user_roles.
-- Without this policy, only admins could read roles (via "Admins can view all roles"),
-- which created a deadlock for staff users and prevented login from completing.

-- 1) Let every authenticated user SELECT their own row
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;

CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);
