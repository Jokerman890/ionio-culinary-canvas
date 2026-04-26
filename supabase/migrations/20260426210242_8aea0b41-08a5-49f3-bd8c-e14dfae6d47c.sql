-- Categories: rename + re-sort
UPDATE public.menu_categories SET name='Kalte Vorspeisen', sort_order=0 WHERE name='Vorspeisen';
UPDATE public.menu_categories SET name='Gyros und Grillgerichte', sort_order=2 WHERE name='Fleischgerichte';
UPDATE public.menu_categories SET sort_order=1 WHERE name='Salate';
UPDATE public.menu_categories SET sort_order=3 WHERE name='Fischgerichte';
UPDATE public.menu_categories SET sort_order=4 WHERE name='Nudelgerichte';
UPDATE public.menu_categories SET sort_order=5 WHERE name='Kindergerichte';
UPDATE public.menu_categories SET sort_order=6 WHERE name='Beilagen';
UPDATE public.menu_categories SET sort_order=7 WHERE name='Nachspeisen';

-- Helper: capture category ids
DO $$
DECLARE
  cat_kalt   uuid := (SELECT id FROM public.menu_categories WHERE name='Kalte Vorspeisen');
  cat_salat  uuid := (SELECT id FROM public.menu_categories WHERE name='Salate');
  cat_grill  uuid := (SELECT id FROM public.menu_categories WHERE name='Gyros und Grillgerichte');
  cat_fisch  uuid := (SELECT id FROM public.menu_categories WHERE name='Fischgerichte');
  cat_nudel  uuid := (SELECT id FROM public.menu_categories WHERE name='Nudelgerichte');
  cat_kind   uuid := (SELECT id FROM public.menu_categories WHERE name='Kindergerichte');
  cat_beil   uuid := (SELECT id FROM public.menu_categories WHERE name='Beilagen');
  cat_nach   uuid := (SELECT id FROM public.menu_categories WHERE name='Nachspeisen');
BEGIN
  -- Kalte Vorspeisen (5-16)
  UPDATE public.menu_items SET dish_number='5',  sort_order=5  WHERE category_id=cat_kalt AND name='Tzatziki';
  UPDATE public.menu_items SET dish_number='6',  sort_order=6  WHERE category_id=cat_kalt AND name='Taramosalata';
  UPDATE public.menu_items SET dish_number='7',  sort_order=7  WHERE category_id=cat_kalt AND name='Hummus';
  UPDATE public.menu_items SET dish_number='8',  sort_order=8  WHERE category_id=cat_kalt AND name='Dolmadakia';
  UPDATE public.menu_items SET dish_number='9',  sort_order=9  WHERE category_id=cat_kalt AND name='Gigantes Plaki';
  UPDATE public.menu_items SET dish_number='10', sort_order=10 WHERE category_id=cat_kalt AND name='Feta Saganaki';
  UPDATE public.menu_items SET dish_number='11', sort_order=11 WHERE category_id=cat_kalt AND name='Calamari';
  UPDATE public.menu_items SET dish_number='16', sort_order=16 WHERE category_id=cat_kalt AND name='Gemischte Vorspeisenplatte';

  -- Salate (40-45)
  UPDATE public.menu_items SET dish_number='40', sort_order=40 WHERE category_id=cat_salat AND name='Bauernsalat (Horiatiki)';
  UPDATE public.menu_items SET dish_number='41', sort_order=41 WHERE category_id=cat_salat AND name='Gemischter Salat';
  UPDATE public.menu_items SET dish_number='42', sort_order=42 WHERE category_id=cat_salat AND name='Krautsalat';
  UPDATE public.menu_items SET dish_number='45', sort_order=45 WHERE category_id=cat_salat AND name='Salat mit gegrilltem Hähnchen';

  -- Gyros und Grillgerichte (48-64)
  UPDATE public.menu_items SET dish_number='48', sort_order=48 WHERE category_id=cat_grill AND name='Gyros';
  UPDATE public.menu_items SET dish_number='50', sort_order=50 WHERE category_id=cat_grill AND name='Suflaki';
  UPDATE public.menu_items SET dish_number='52', sort_order=52 WHERE category_id=cat_grill AND name='Bifteki';
  UPDATE public.menu_items SET dish_number='55', sort_order=55 WHERE category_id=cat_grill AND name='Hähnchenbrustfilet';
  UPDATE public.menu_items SET dish_number='58', sort_order=58 WHERE category_id=cat_grill AND name='Schweinefilet';
  UPDATE public.menu_items SET dish_number='62', sort_order=62 WHERE category_id=cat_grill AND name='Lammkoteletts';
  UPDATE public.menu_items SET dish_number='64', sort_order=64 WHERE category_id=cat_grill AND name='Gemischte Fleischplatte';

  -- Fischgerichte (120-128)
  UPDATE public.menu_items SET dish_number='120', sort_order=120 WHERE category_id=cat_fisch AND name='Lachsfilet';
  UPDATE public.menu_items SET dish_number='121', sort_order=121 WHERE category_id=cat_fisch AND name='Zanderfilet';
  UPDATE public.menu_items SET dish_number='123', sort_order=123 WHERE category_id=cat_fisch AND name='Calamari vom Grill';
  UPDATE public.menu_items SET dish_number='125', sort_order=125 WHERE category_id=cat_fisch AND name='Scampi';
  UPDATE public.menu_items SET dish_number='128', sort_order=128 WHERE category_id=cat_fisch AND name='Gemischte Fischplatte';

  -- Nudelgerichte (140-146)
  UPDATE public.menu_items SET dish_number='140', sort_order=140 WHERE category_id=cat_nudel AND name='Spaghetti Bolognese';
  UPDATE public.menu_items SET dish_number='141', sort_order=141 WHERE category_id=cat_nudel AND name='Tortellini in Sahne-Käsesauce';
  UPDATE public.menu_items SET dish_number='142', sort_order=142 WHERE category_id=cat_nudel AND name='Kritharaki mit Gemüse';
  UPDATE public.menu_items SET dish_number='143', sort_order=143 WHERE category_id=cat_nudel AND name='Kritharaki mit Meeresfrüchten';
  UPDATE public.menu_items SET dish_number='144', sort_order=144 WHERE category_id=cat_nudel AND name='Spaghetti mit Shrimps';
  UPDATE public.menu_items SET dish_number='145', sort_order=145 WHERE category_id=cat_nudel AND name='Khinkali vegetarisch';
  UPDATE public.menu_items SET dish_number='146', sort_order=146 WHERE category_id=cat_nudel AND name='Khinkali';

  -- Kindergerichte (150-155)
  UPDATE public.menu_items SET dish_number='150', sort_order=150 WHERE category_id=cat_kind AND name='Kinder Gyros';
  UPDATE public.menu_items SET dish_number='151', sort_order=151 WHERE category_id=cat_kind AND name='Suflaki';
  UPDATE public.menu_items SET dish_number='152', sort_order=152 WHERE category_id=cat_kind AND name='Schnitzel';
  UPDATE public.menu_items SET dish_number='153', sort_order=153 WHERE category_id=cat_kind AND name='Spaghetti Bolognese';
  UPDATE public.menu_items SET dish_number='154', sort_order=154 WHERE category_id=cat_kind AND name='Spaghetti Napoli';
  UPDATE public.menu_items SET dish_number='155', sort_order=155 WHERE category_id=cat_kind AND name='Chicken Nuggets';

  -- Beilagen (160-167)
  UPDATE public.menu_items SET dish_number='160', sort_order=160 WHERE category_id=cat_beil AND name='Pommes Frites';
  UPDATE public.menu_items SET dish_number='161', sort_order=161 WHERE category_id=cat_beil AND name='Rosmarinkartoffeln';
  UPDATE public.menu_items SET dish_number='162', sort_order=162 WHERE category_id=cat_beil AND name='Butterreis';
  UPDATE public.menu_items SET dish_number='163', sort_order=163 WHERE category_id=cat_beil AND name='Tomatenreis';
  UPDATE public.menu_items SET dish_number='164', sort_order=164 WHERE category_id=cat_beil AND name='Gemischtes Gemüse';
  UPDATE public.menu_items SET dish_number='165', sort_order=165 WHERE category_id=cat_beil AND name='Pita mit Knoblauch';
  UPDATE public.menu_items SET dish_number='166', sort_order=166 WHERE category_id=cat_beil AND name='Pita mit Oregano';
  UPDATE public.menu_items SET dish_number='167', sort_order=167 WHERE category_id=cat_beil AND name='Brot hausgemacht';

  -- Nachspeisen (180-185)
  UPDATE public.menu_items SET dish_number='180', sort_order=180 WHERE category_id=cat_nach AND name='Baklava';
  UPDATE public.menu_items SET dish_number='181', sort_order=181 WHERE category_id=cat_nach AND name='Galaktoboureko';
  UPDATE public.menu_items SET dish_number='182', sort_order=182 WHERE category_id=cat_nach AND name='Joghurt mit Walnüssen';
  UPDATE public.menu_items SET dish_number='183', sort_order=183 WHERE category_id=cat_nach AND name='Schokoladenkuchen';
END$$;