export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  allergens?: string;
  vegetarian?: boolean;
  popular?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
  {
    id: 'vorspeisen',
    name: 'Vorspeisen',
    description: 'Traditionelle griechische Mezedes zum Teilen',
    items: [
      { id: 'v1', name: 'Tzatziki', description: 'Joghurt mit Gurken, Knoblauch und Dill', price: '5,90 €', allergens: 'g', vegetarian: true },
      { id: 'v2', name: 'Taramosalata', description: 'Cremige Fischrogencreme nach Hausrezept', price: '6,20 €', allergens: 'd, g' },
      { id: 'v3', name: 'Hummus', description: 'Kichererbsenpüree mit Olivenöl und Sesam', price: '5,90 €', allergens: 'k', vegetarian: true },
      { id: 'v4', name: 'Dolmadakia', description: 'Gefüllte Weinblätter mit Reis und Kräutern', price: '6,80 €', vegetarian: true },
      { id: 'v5', name: 'Feta Saganaki', description: 'Panierter Schafskäse, knusprig gebraten', price: '8,20 €', allergens: 'a, g' },
      { id: 'v6', name: 'Calamari', description: 'Frittierte Tintenfischringe mit Zitrone', price: '9,80 €', allergens: 'a, n', popular: true },
      { id: 'v7', name: 'Gemischte Vorspeisenplatte', description: 'Auswahl unserer besten Vorspeisen für 2 Personen', price: '16,90 €', allergens: 'a, g, d' },
      { id: 'v8', name: 'Gigantes Plaki', description: 'Weiße Riesenbohnen in Tomatensauce', price: '6,50 €', vegetarian: true },
    ],
  },
  {
    id: 'salate',
    name: 'Salate',
    description: 'Frische mediterrane Salate',
    items: [
      { id: 's1', name: 'Bauernsalat (Horiatiki)', description: 'Tomaten, Gurken, Paprika, Oliven, Zwiebeln und Feta', price: '10,90 €', allergens: 'g', vegetarian: true, popular: true },
      { id: 's2', name: 'Gemischter Salat', description: 'Blattsalate der Saison mit Hausdressing', price: '6,90 €', vegetarian: true },
      { id: 's3', name: 'Krautsalat', description: 'Traditioneller griechischer Krautsalat', price: '4,90 €', vegetarian: true },
      { id: 's4', name: 'Salat mit gegrilltem Hähnchen', description: 'Gemischte Salate mit Hähnchenbruststreifen', price: '13,90 €', allergens: 'g' },
    ],
  },
  {
    id: 'fleisch',
    name: 'Fleischgerichte',
    description: 'Vom Holzkohlegrill – serviert mit Beilagen nach Wahl',
    items: [
      { id: 'f1', name: 'Gyros', description: 'Zartes Schweinefleisch vom Drehspieß mit Tzatziki', price: '14,80 €', allergens: 'g', popular: true },
      { id: 'f2', name: 'Suflaki', description: 'Zwei Schweinefleischspieße vom Grill', price: '15,20 €', allergens: 'g' },
      { id: 'f3', name: 'Bifteki', description: 'Griechisches Hacksteak mit Schafskäse gefüllt', price: '16,80 €', allergens: 'g', popular: true },
      { id: 'f4', name: 'Lammkoteletts', description: 'Zarte Lammkoteletts vom Holzkohlegrill', price: '22,90 €', allergens: 'g' },
      { id: 'f5', name: 'Hähnchenbrustfilet', description: 'Gegrillte Hähnchenbrust mit Kräutern', price: '15,90 €', allergens: 'g' },
      { id: 'f6', name: 'Schweinefilet', description: 'Zartes Schweinefilet in Metaxasauce', price: '19,80 €', allergens: 'g' },
      { id: 'f7', name: 'Gemischte Fleischplatte', description: 'Auswahl vom Grill für 2 Personen', price: '43,80 €', allergens: 'g', popular: true },
    ],
  },
  {
    id: 'fisch',
    name: 'Fischgerichte',
    description: 'Frisch aus dem Mittelmeer',
    items: [
      { id: 'fi1', name: 'Lachsfilet', description: 'Gegrillter Lachs mit Zitronenbutter', price: '19,90 €', allergens: 'd, g' },
      { id: 'fi2', name: 'Zanderfilet', description: 'Zartes Zanderfilet vom Grill', price: '21,90 €', allergens: 'd, g' },
      { id: 'fi3', name: 'Scampi', description: 'Gegrillte Riesengarnelen mit Knoblauch', price: '24,90 €', allergens: 'b, g', popular: true },
      { id: 'fi4', name: 'Gemischte Fischplatte', description: 'Zander, Scampi, Lachs und Calamari für 2 Personen', price: '53,40 €', allergens: 'a, b, d, g, n' },
      { id: 'fi5', name: 'Calamari vom Grill', description: 'Ganze Calamari gegrillt mit Zitrone', price: '18,90 €', allergens: 'n' },
    ],
  },
  {
    id: 'nudeln',
    name: 'Nudelgerichte',
    description: 'Alle Gerichte mit Salat',
    items: [
      { id: 'n1', name: 'Kritharaki mit Meeresfrüchten', description: 'Griechische Reisnudeln mit Meeresfrüchten', price: '17,20 €', allergens: 'a, b, d, n' },
      { id: 'n2', name: 'Tortellini in Sahne-Käsesauce', description: 'Gefüllt mit Hackfleisch', price: '13,40 €', allergens: 'a, g' },
      { id: 'n3', name: 'Kritharaki mit Gemüse', description: 'In Metaxa-Sauce', price: '14,50 €', allergens: 'a, g', vegetarian: true },
      { id: 'n4', name: 'Spaghetti mit Shrimps', description: 'In Tomatensauce', price: '23,80 €', allergens: 'a, b' },
      { id: 'n5', name: 'Spaghetti Bolognese', description: 'Mit Käse überbacken', price: '14,70 €', allergens: 'a, g' },
      { id: 'n6', name: 'Khinkali', description: 'Georgische Teigtaschen mit Fleischfüllung', price: '18,00 €', allergens: 'a' },
      { id: 'n7', name: 'Khinkali vegetarisch', description: 'Georgische Teigtaschen mit Gemüsefüllung', price: '16,80 €', allergens: 'a', vegetarian: true },
    ],
  },
  {
    id: 'kinder',
    name: 'Kindergerichte',
    description: 'Für unsere kleinen Gäste',
    items: [
      { id: 'k1', name: 'Kinder Gyros', description: 'Kleine Portion mit Pommes', price: '8,80 €', allergens: 'a, g' },
      { id: 'k2', name: 'Suflaki', description: 'Ein Spieß mit Pommes', price: '8,80 €', allergens: 'g' },
      { id: 'k3', name: 'Schnitzel', description: 'Paniertes Schnitzel mit Pommes', price: '8,80 €', allergens: 'a, g' },
      { id: 'k4', name: 'Spaghetti Bolognese', description: 'Mit Hackfleischsauce', price: '8,30 €', allergens: 'a, g' },
      { id: 'k5', name: 'Spaghetti Napoli', description: 'Mit Tomatensauce', price: '7,60 €', allergens: 'a', vegetarian: true },
      { id: 'k6', name: 'Chicken Nuggets', description: 'Mit Pommes und Ketchup', price: '9,60 €', allergens: 'a' },
    ],
  },
  {
    id: 'beilagen',
    name: 'Beilagen',
    items: [
      { id: 'b1', name: 'Pommes Frites', price: '3,90 €', vegetarian: true },
      { id: 'b2', name: 'Rosmarinkartoffeln', description: 'Mit Thymian', price: '5,20 €', allergens: 'g', vegetarian: true },
      { id: 'b3', name: 'Butterreis', price: '3,80 €', allergens: 'g', vegetarian: true },
      { id: 'b4', name: 'Tomatenreis', price: '3,80 €', vegetarian: true },
      { id: 'b5', name: 'Gemischtes Gemüse', price: '4,80 €', vegetarian: true },
      { id: 'b6', name: 'Brot hausgemacht', price: '1,80 €', allergens: 'a', vegetarian: true },
      { id: 'b7', name: 'Pita mit Oregano', price: '2,80 €', allergens: 'a', vegetarian: true },
      { id: 'b8', name: 'Pita mit Knoblauch', price: '2,90 €', allergens: 'a', vegetarian: true },
    ],
  },
  {
    id: 'desserts',
    name: 'Nachspeisen',
    description: 'Süßer Abschluss nach griechischer Art',
    items: [
      { id: 'd1', name: 'Galaktoboureko', description: 'Blätterteig mit Grießpudding und Sirup', price: '7,20 €', allergens: 'a, g', popular: true },
      { id: 'd2', name: 'Baklava', description: 'Blätterteig mit Nüssen und Honig', price: '7,20 €', allergens: 'a, h' },
      { id: 'd3', name: 'Schokoladenkuchen', description: 'Hausgemachter Schokokuchen', price: '6,80 €', allergens: 'a, g' },
      { id: 'd4', name: 'Joghurt mit Walnüssen', description: 'Griechischer Joghurt mit Nüssen und Honig', price: '6,10 €', allergens: 'g, h', vegetarian: true },
    ],
  },
];

export const allergenInfo: Record<string, string> = {
  a: 'Weizen/Gluten',
  b: 'Krebstiere',
  c: 'Eier',
  d: 'Fisch',
  e: 'Erdnüsse',
  f: 'Soja',
  g: 'Milch/Laktose',
  h: 'Schalenfrüchte',
  i: 'Sellerie',
  j: 'Senf',
  k: 'Sesam',
  l: 'Sulfit',
  m: 'Lupine',
  n: 'Weichtiere',
};
