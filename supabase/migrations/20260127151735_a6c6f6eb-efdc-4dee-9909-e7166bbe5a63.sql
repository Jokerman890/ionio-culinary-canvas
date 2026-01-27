-- Create weekly_offers table for 3 weekly special dishes
CREATE TABLE public.weekly_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 3),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  is_active BOOLEAN DEFAULT true,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(position)
);

-- Enable RLS
ALTER TABLE public.weekly_offers ENABLE ROW LEVEL SECURITY;

-- Anyone can view active offers
CREATE POLICY "Anyone can view active weekly offers"
ON public.weekly_offers
FOR SELECT
USING (is_active = true OR is_admin_or_staff(auth.uid()));

-- Admin/Staff can insert
CREATE POLICY "Admin/Staff can insert weekly offers"
ON public.weekly_offers
FOR INSERT
WITH CHECK (is_admin_or_staff(auth.uid()));

-- Admin/Staff can update
CREATE POLICY "Admin/Staff can update weekly offers"
ON public.weekly_offers
FOR UPDATE
USING (is_admin_or_staff(auth.uid()));

-- Admin/Staff can delete
CREATE POLICY "Admin/Staff can delete weekly offers"
ON public.weekly_offers
FOR DELETE
USING (is_admin_or_staff(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_weekly_offers_updated_at
BEFORE UPDATE ON public.weekly_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add is_popular to menu_items for highlighting popular dishes
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;

-- Insert placeholder weekly offers
INSERT INTO public.weekly_offers (position, name, description, price, original_price, is_active)
VALUES 
  (1, 'Wochenangebot 1', 'Beschreibung des ersten Angebots', 12.90, 15.90, true),
  (2, 'Wochenangebot 2', 'Beschreibung des zweiten Angebots', 14.90, 18.90, true),
  (3, 'Wochenangebot 3', 'Beschreibung des dritten Angebots', 16.90, 21.90, true);