-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin or staff
CREATE OR REPLACE FUNCTION public.is_admin_or_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'staff')
  )
$$;

-- RLS policies for user_roles (only admins can manage roles)
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create menu_categories table
CREATE TABLE public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on menu_categories
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

-- Public can read categories
CREATE POLICY "Anyone can view menu categories"
  ON public.menu_categories FOR SELECT
  USING (true);

-- Only admin/staff can modify
CREATE POLICY "Admin/Staff can insert categories"
  ON public.menu_categories FOR INSERT
  WITH CHECK (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admin/Staff can update categories"
  ON public.menu_categories FOR UPDATE
  USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admin/Staff can delete categories"
  ON public.menu_categories FOR DELETE
  USING (public.is_admin_or_staff(auth.uid()));

-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  allergens TEXT[] DEFAULT '{}',
  is_vegetarian BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Public can read available items
CREATE POLICY "Anyone can view available menu items"
  ON public.menu_items FOR SELECT
  USING (true);

-- Only admin/staff can modify
CREATE POLICY "Admin/Staff can insert items"
  ON public.menu_items FOR INSERT
  WITH CHECK (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admin/Staff can update items"
  ON public.menu_items FOR UPDATE
  USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admin/Staff can delete items"
  ON public.menu_items FOR DELETE
  USING (public.is_admin_or_staff(auth.uid()));

-- Create gallery_images table
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on gallery_images
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Public can read visible images
CREATE POLICY "Anyone can view visible gallery images"
  ON public.gallery_images FOR SELECT
  USING (is_visible = true OR public.is_admin_or_staff(auth.uid()));

-- Only admin/staff can modify
CREATE POLICY "Admin/Staff can insert images"
  ON public.gallery_images FOR INSERT
  WITH CHECK (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admin/Staff can update images"
  ON public.gallery_images FOR UPDATE
  USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admin/Staff can delete images"
  ON public.gallery_images FOR DELETE
  USING (public.is_admin_or_staff(auth.uid()));

-- Create restaurant_settings table for opening hours etc.
CREATE TABLE public.restaurant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on restaurant_settings
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings
CREATE POLICY "Anyone can view settings"
  ON public.restaurant_settings FOR SELECT
  USING (true);

-- Only admin/staff can modify
CREATE POLICY "Admin/Staff can insert settings"
  ON public.restaurant_settings FOR INSERT
  WITH CHECK (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admin/Staff can update settings"
  ON public.restaurant_settings FOR UPDATE
  USING (public.is_admin_or_staff(auth.uid()));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_menu_categories_updated_at
  BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_restaurant_settings_updated_at
  BEFORE UPDATE ON public.restaurant_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

-- Storage policies for gallery bucket
CREATE POLICY "Anyone can view gallery images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

CREATE POLICY "Admin/Staff can upload gallery images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery' AND public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admin/Staff can update gallery images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gallery' AND public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Admin/Staff can delete gallery images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery' AND public.is_admin_or_staff(auth.uid()));

-- Insert default opening hours
INSERT INTO public.restaurant_settings (key, value) VALUES 
  ('opening_hours', '{
    "monday": {"open": "11:30", "close": "14:30", "evening_open": "17:30", "evening_close": "22:30", "closed": false},
    "tuesday": {"closed": true},
    "wednesday": {"open": "11:30", "close": "14:30", "evening_open": "17:30", "evening_close": "22:30", "closed": false},
    "thursday": {"open": "11:30", "close": "14:30", "evening_open": "17:30", "evening_close": "22:30", "closed": false},
    "friday": {"open": "11:30", "close": "14:30", "evening_open": "17:30", "evening_close": "22:30", "closed": false},
    "saturday": {"open": "11:30", "close": "14:30", "evening_open": "17:30", "evening_close": "22:30", "closed": false},
    "sunday": {"open": "11:30", "close": "14:30", "evening_open": "17:30", "evening_close": "22:30", "closed": false}
  }'::jsonb),
  ('phone', '"04222 77 411 10"'::jsonb),
  ('address', '{"street": "Mühlenstr. 23", "zip": "27777", "city": "Ganderkesee"}'::jsonb);