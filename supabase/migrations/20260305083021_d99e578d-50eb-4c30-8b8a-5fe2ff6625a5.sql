UPDATE menu_items SET is_vegetarian = true WHERE dish_number IN ('142', '146');

-- Also fix dish numbers for Vegetarisch category items that are missing them
UPDATE menu_items SET dish_number = '110' WHERE name = 'Paprika gefüllt' AND is_vegetarian = true AND dish_number IS NULL;
UPDATE menu_items SET dish_number = '111' WHERE name = 'Briam' AND is_vegetarian = true AND dish_number IS NULL;
UPDATE menu_items SET dish_number = '112' WHERE name = 'Gemischtes Gemüse' AND is_vegetarian = true AND dish_number IS NULL;
UPDATE menu_items SET dish_number = '114' WHERE name = 'Musakas' AND is_vegetarian = true AND dish_number IS NULL;