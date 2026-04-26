-- Step 1: remove duplicate menu_items by ctid (handles identical created_at)
DELETE FROM public.menu_items
WHERE ctid IN (
  SELECT ctid FROM (
    SELECT ctid, row_number() OVER (PARTITION BY category_id, name ORDER BY created_at, ctid) AS rn
    FROM public.menu_items
  ) t
  WHERE rn > 1
);

-- Step 2: remove duplicate menu_categories by ctid
DELETE FROM public.menu_categories
WHERE ctid IN (
  SELECT ctid FROM (
    SELECT ctid, row_number() OVER (PARTITION BY name ORDER BY created_at, ctid) AS rn
    FROM public.menu_categories
  ) t
  WHERE rn > 1
);

-- Step 3: add unique constraints
ALTER TABLE public.menu_items
  DROP CONSTRAINT IF EXISTS menu_items_category_name_unique,
  ADD CONSTRAINT menu_items_category_name_unique UNIQUE (category_id, name);

ALTER TABLE public.menu_categories
  DROP CONSTRAINT IF EXISTS menu_categories_name_unique,
  ADD CONSTRAINT menu_categories_name_unique UNIQUE (name);