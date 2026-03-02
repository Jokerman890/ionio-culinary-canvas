export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  allergens?: string;
  vegetarian?: boolean;
  popular?: boolean;
  dishNumber?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
  {
    id: 'suppen',
    name: 'Suppen',
    items: [
      { id: '1', dishNumber: '1', name: 'Griechische Hühnersuppe', description: 'mit Ei und Zitrone', price: '5,80 €' },
      { id: '2', dishNumber: '2', name: 'Griechische Bohnensuppe', price: '5,80 €', vegetarian: true },
      { id: '3', dishNumber: '3', name: 'Tomatensuppe', price: '5,30 €', vegetarian: true },
    ],
  },
  {
    id: 'kalte-vorspeisen',
    name: 'Kalte Vorspeisen',
    items: [
      { id: '5', dishNumber: '5', name: 'Tzatziki', description: 'Joghurt mit Gurke und Knoblauch', price: '5,90 €', allergens: 'g', vegetarian: true },
      { id: '6', dishNumber: '6', name: 'Taramosalata', description: 'Fischrogencreme', price: '6,20 €', allergens: 'd, g' },
      { id: '7', dishNumber: '7', name: 'Hummus', description: 'Kichererbsenpüree mit Sesam', price: '5,90 €', allergens: 'k', vegetarian: true },
      { id: '8', dishNumber: '8', name: 'Dolmadakia', description: 'Gefüllte Weinblätter mit Reis', price: '6,80 €', vegetarian: true },
      { id: '9', dishNumber: '9', name: 'Rote Beete Salat', price: '5,80 €', vegetarian: true },
      { id: '10', dishNumber: '10', name: 'Oliven mariniert', price: '5,80 €', vegetarian: true },
      { id: '11', dishNumber: '11', name: 'Peperoni mild', description: 'gegrillt', price: '5,80 €', vegetarian: true },
      { id: '12', dishNumber: '12', name: 'Schafskäse', price: '6,50 €', allergens: 'g', vegetarian: true },
      { id: '13', dishNumber: '13', name: 'Meeresfrüchtesalat', price: '10,20 €', allergens: 'b, n' },
      { id: '14', dishNumber: '14', name: 'Oktopus Salat', price: '11,80 €', allergens: 'n' },
      { id: '15', dishNumber: '15', name: 'Kalte Vorspeisenplatte', description: 'für 2 Personen', price: '16,90 €', allergens: 'g' },
      { id: '16', dishNumber: '16', name: 'Kleine kalte Vorspeisenplatte', description: 'für 1 Person', price: '10,50 €', allergens: 'g' },
    ],
  },
  {
    id: 'warme-vorspeisen',
    name: 'Warme Vorspeisen',
    items: [
      { id: '20', dishNumber: '20', name: 'Calamari', description: 'frittiert', price: '9,80 €', allergens: 'a, n' },
      { id: '21', dishNumber: '21', name: 'Saganaki', description: 'Schafskäse paniert', price: '8,20 €', allergens: 'a, g', vegetarian: true },
      { id: '22', dishNumber: '22', name: 'Feta aus dem Ofen', description: 'mit Tomaten und Peperoni', price: '8,80 €', allergens: 'g', vegetarian: true },
      { id: '23', dishNumber: '23', name: 'Gigantes Plaki', description: 'Riesenbohnen in Tomatensauce', price: '7,40 €', vegetarian: true },
      { id: '24', dishNumber: '24', name: 'Gebratene Peperoni', description: 'mit Knoblauch und Olivenöl', price: '7,20 €', vegetarian: true },
      { id: '25', dishNumber: '25', name: 'Halloumi', description: 'gegrillt', price: '9,80 €', allergens: 'g', vegetarian: true },
      { id: '26', dishNumber: '26', name: 'Keftedakia', description: 'griechische Frikadellen', price: '8,80 €', allergens: 'a' },
      { id: '27', dishNumber: '27', name: 'Loukaniko', description: 'griechische Bratwürstchen', price: '8,80 €' },
      { id: '28', dishNumber: '28', name: 'Haloumi-Loukaniko', description: 'mit Tomaten und Peperoni', price: '10,80 €', allergens: 'g' },
      { id: '29', dishNumber: '29', name: 'Spezial Saganaki', description: 'mit Garnelen und Tomaten überbacken', price: '12,80 €', allergens: 'b, g' },
      { id: '30', dishNumber: '30', name: 'Scampi Saganaki', description: 'mit Tomaten und Schafskäse überbacken', price: '14,80 €', allergens: 'b, g' },
      { id: '31', dishNumber: '31', name: 'Warme Vorspeisenplatte', description: 'für 2 Personen', price: '18,40 €', allergens: 'a, g' },
      { id: '32', dishNumber: '32', name: 'Kleine warme Vorspeisenplatte', description: 'für 1 Person', price: '11,80 €', allergens: 'a, g' },
      { id: '33', dishNumber: '33', name: 'Gemischte Vorspeisenplatte', description: 'kalt und warm für 2 Personen', price: '22,80 €', allergens: 'a, g' },
      { id: '34', dishNumber: '34', name: 'Kleine gemischte Vorspeisenplatte', description: 'kalt und warm für 1 Person', price: '13,80 €', allergens: 'a, g' },
      { id: '35', dishNumber: '35', name: 'Calamari vom Grill', price: '10,80 €', allergens: 'n' },
      { id: '36', dishNumber: '36', name: 'Oktopus vom Grill', price: '14,80 €', allergens: 'n' },
      { id: '37', dishNumber: '37', name: 'Garnelen vom Grill', price: '14,80 €', allergens: 'b' },
      { id: '38', dishNumber: '38', name: 'Sardinen vom Grill', price: '9,80 €', allergens: 'd' },
      { id: '39', dishNumber: '39', name: 'Gambas', description: 'in Knoblauch-Olivenöl', price: '14,80 €', allergens: 'b' },
    ],
  },
  {
    id: 'salate',
    name: 'Salate',
    items: [
      { id: '40', dishNumber: '40', name: 'Bauernsalat (Horiatiki)', description: 'Tomaten, Gurken, Zwiebeln, Paprika, Oliven und Feta', price: '10,90 €', allergens: 'g', vegetarian: true, popular: true },
      { id: '41', dishNumber: '41', name: 'Gemischter Salat', price: '6,90 €', vegetarian: true },
      { id: '42', dishNumber: '42', name: 'Krautsalat', price: '4,90 €', vegetarian: true },
      { id: '43', dishNumber: '43', name: 'Rucola-Salat', description: 'mit Cherry-Tomaten, Parmesan und Balsamico', price: '11,80 €', allergens: 'g', vegetarian: true },
      { id: '44', dishNumber: '44', name: 'Salat mit Hähnchenbrust', price: '13,90 €' },
      { id: '45', dishNumber: '45', name: 'Salat mit Garnelen', price: '16,90 €', allergens: 'b' },
    ],
  },
  {
    id: 'gyros-grill',
    name: 'Gyros und Grillgerichte',
    description: 'Alle Gerichte werden mit Salat und einer Beilage nach Wahl serviert',
    items: [
      { id: '48', dishNumber: '48', name: 'Gyros', description: 'mit gebratenen Zwiebeln und Paprika', price: '15,90 €', allergens: 'g' },
      { id: '49', dishNumber: '49', name: 'Suflaki', description: '2 Spieße vom Schwein', price: '15,90 €' },
      { id: '50', dishNumber: '50', name: 'Bifteki', description: 'griechisches Hacksteak', price: '15,90 €' },
      { id: '51', dishNumber: '51', name: 'Lammkoteletts', price: '22,90 €' },
      { id: '52', dishNumber: '52', name: 'Lammkotelett und Suflaki', price: '20,90 €' },
      { id: '53', dishNumber: '53', name: 'Hähnchenbrust', description: 'vom Grill', price: '15,90 €' },
      { id: '54', dishNumber: '54', name: 'Hähnchen Suflaki', description: '2 Spieße', price: '15,90 €' },
      { id: '55', dishNumber: '55', name: 'Schweinefilet Medaillons', description: 'vom Grill', price: '19,80 €' },
      { id: '56', dishNumber: '56', name: 'Rinderfilet', description: 'vom Grill', price: '28,80 €' },
      { id: '57', dishNumber: '57', name: 'Suzuki', description: 'pikante Hackfleischröllchen', price: '15,90 €' },
      { id: '58', dishNumber: '58', name: 'Schnitzel', description: 'paniert', price: '14,90 €', allergens: 'a' },
      { id: '59', dishNumber: '59', name: 'Schnitzel überbacken', description: 'mit Schinken und Käse', price: '17,80 €', allergens: 'a, g' },
      { id: '60', dishNumber: '60', name: 'Steak', description: '200g Schweinenackensteak', price: '15,90 €' },
      { id: '61', dishNumber: '61', name: 'Spare Ribs', price: '18,80 €' },
      { id: '62', dishNumber: '62', name: 'Metaxa Schnitzel', price: '17,80 €', allergens: 'a, g' },
      { id: '63', dishNumber: '63', name: 'Kotelett vom Schwein', price: '15,80 €' },
      { id: '64', dishNumber: '64', name: 'Gyros überbacken', description: 'mit Käse und Sauce', price: '17,80 €', allergens: 'g' },
    ],
  },
  {
    id: 'mix-teller',
    name: 'Mix-Teller',
    description: 'Alle Mix-Teller werden mit Salat und einer Beilage nach Wahl serviert',
    items: [
      { id: '70', dishNumber: '70', name: 'Ionio-Teller', description: 'Gyros, Suflaki, Bifteki', price: '18,90 €', allergens: 'g' },
      { id: '71', dishNumber: '71', name: 'Rhodos-Teller', description: 'Lammkotelett, Suflaki, Bifteki', price: '21,90 €' },
      { id: '72', dishNumber: '72', name: 'Athen-Teller', description: 'Gyros, Suflaki, Lammkotelett', price: '21,90 €' },
      { id: '73', dishNumber: '73', name: 'Kreta-Teller', description: 'Suflaki, Hähnchenbrust, Bifteki', price: '18,90 €' },
      { id: '74', dishNumber: '74', name: 'Korfu-Teller', description: 'Hähnchenbrust, Suzuki, Lammkotelett', price: '21,90 €' },
      { id: '75', dishNumber: '75', name: 'Olymp-Teller', description: 'Gyros, Lammkotelett, Suzuki', price: '21,90 €' },
      { id: '76', dishNumber: '76', name: 'Mykonos-Teller', description: 'Schweinefilet, Suflaki, Gyros', price: '20,90 €' },
      { id: '77', dishNumber: '77', name: 'Santorini-Teller', description: 'Rinderfilet, Hähnchenbrust, Suflaki', price: '26,90 €' },
    ],
  },
  {
    id: 'spezialitaeten',
    name: 'Spezialitäten des Hauses',
    description: 'Alle Spezialitäten werden mit Salat und einer Beilage nach Wahl serviert',
    items: [
      { id: '80', dishNumber: '80', name: 'Gyros Metaxa', description: 'Gyros mit Metaxasauce', price: '17,80 €', allergens: 'g' },
      { id: '81', dishNumber: '81', name: 'Bifteki Spezial', description: 'gefüllt mit Schafskäse', price: '17,80 €', allergens: 'g' },
      { id: '82', dishNumber: '82', name: 'Soutzoukakia', description: 'Hackfleischröllchen in Tomatensauce', price: '16,80 €' },
      { id: '83', dishNumber: '83', name: 'Stifado', description: 'Rindergulasch mit Zwiebeln', price: '18,80 €' },
      { id: '84', dishNumber: '84', name: 'Kleftiko', description: 'Lamm aus dem Ofen', price: '22,80 €' },
      { id: '85', dishNumber: '85', name: 'Arnaki', description: 'Lammkeule aus dem Ofen', price: '22,80 €' },
      { id: '86', dishNumber: '86', name: 'Moussaka', description: 'Auberginenauflauf mit Hackfleisch', price: '15,90 €', allergens: 'a, g' },
    ],
  },
  {
    id: 'pfaennchen',
    name: 'Pfännchen',
    description: 'Alle Pfännchen werden mit Salat und einer Beilage nach Wahl serviert',
    items: [
      { id: '90', dishNumber: '90', name: 'Gyros Pfännchen', description: 'mit Metaxasauce und Käse überbacken', price: '18,80 €', allergens: 'g' },
      { id: '91', dishNumber: '91', name: 'Hähnchen Pfännchen', description: 'mit Gemüse und Käse überbacken', price: '18,80 €', allergens: 'g' },
      { id: '92', dishNumber: '92', name: 'Suflaki Pfännchen', description: 'mit Paprika, Zwiebeln und Käse überbacken', price: '18,80 €', allergens: 'g' },
      { id: '93', dishNumber: '93', name: 'Bifteki Pfännchen', description: 'mit Tomatensauce und Käse überbacken', price: '18,80 €', allergens: 'g' },
      { id: '94', dishNumber: '94', name: 'Garnelen Pfännchen', description: 'mit Tomaten und Schafskäse überbacken', price: '22,80 €', allergens: 'b, g' },
      { id: '95', dishNumber: '95', name: 'Gemüse Pfännchen', description: 'vegetarisch mit Schafskäse überbacken', price: '16,80 €', allergens: 'g', vegetarian: true },
    ],
  },
  {
    id: 'empfehlungen',
    name: 'Wir empfehlen',
    items: [
      { id: '100', dishNumber: '100', name: 'Lamm Chops', description: 'Lamm auf dem Knochen mit Kartoffeln aus dem Ofen', price: '25,80 €', popular: true },
      { id: '101', dishNumber: '101', name: 'Rinderfilet Spezial', description: 'mit Garnelen und Tomatensauce', price: '32,80 €', allergens: 'b', popular: true },
    ],
  },
  {
    id: 'vegetarisch',
    name: 'Vegetarisch',
    description: 'Alle Gerichte werden mit Salat und einer Beilage nach Wahl serviert',
    items: [
      { id: '110', dishNumber: '110', name: 'Gemüse Platte', description: 'gegrilltes Gemüse der Saison', price: '14,80 €', vegetarian: true },
      { id: '111', dishNumber: '111', name: 'Briam', description: 'Gemüseauflauf aus dem Ofen', price: '14,80 €', vegetarian: true },
      { id: '112', dishNumber: '112', name: 'Halloumi Platte', description: 'gegrillter Halloumi mit Gemüse', price: '16,80 €', allergens: 'g', vegetarian: true },
      { id: '113', dishNumber: '113', name: 'Vegetarische Moussaka', description: 'mit Gemüse statt Hackfleisch', price: '14,80 €', allergens: 'a, g', vegetarian: true },
      { id: '114', dishNumber: '114', name: 'Spinat Reis', description: 'Spanakorizo', price: '13,80 €', vegetarian: true },
    ],
  },
  {
    id: 'fisch',
    name: 'Fischgerichte',
    description: 'Alle Fischgerichte werden mit Salat und einer Beilage nach Wahl serviert',
    items: [
      { id: '120', dishNumber: '120', name: 'Lachs', description: 'vom Grill', price: '19,90 €', allergens: 'd' },
      { id: '121', dishNumber: '121', name: 'Dorade', description: 'ganz, vom Grill', price: '21,90 €', allergens: 'd' },
      { id: '122', dishNumber: '122', name: 'Wolfsbarsch', description: 'ganz, vom Grill', price: '21,90 €', allergens: 'd' },
      { id: '123', dishNumber: '123', name: 'Calamari vom Grill', price: '18,90 €', allergens: 'n' },
      { id: '124', dishNumber: '124', name: 'Scampi', description: 'vom Grill', price: '24,90 €', allergens: 'b' },
      { id: '125', dishNumber: '125', name: 'Oktopus', description: 'vom Grill', price: '22,90 €', allergens: 'n' },
      { id: '126', dishNumber: '126', name: 'Sardinen', description: 'vom Grill', price: '14,90 €', allergens: 'd' },
      { id: '127', dishNumber: '127', name: 'Garnelen Pfännchen', description: 'mit Knoblauch und Weißwein', price: '22,80 €', allergens: 'b' },
      { id: '128', dishNumber: '128', name: 'Fischplatte', description: 'für 1 Person', price: '26,80 €', allergens: 'b, d, n' },
    ],
  },
  {
    id: 'fuer-2',
    name: 'Für 2 Personen',
    items: [
      { id: '130', dishNumber: '130', name: 'Fleischplatte', description: 'für 2 Personen', price: '43,80 €' },
      { id: '131', dishNumber: '131', name: 'Fischplatte', description: 'für 2 Personen', price: '49,80 €', allergens: 'b, d, n' },
      { id: '132', dishNumber: '132', name: 'Gemischte Platte', description: 'Fleisch und Fisch für 2 Personen', price: '52,80 €', allergens: 'b, d, n' },
    ],
  },
  {
    id: 'nudeln',
    name: 'Nudelgerichte',
    description: 'Alle Gerichte mit Salat',
    items: [
      { id: '140', dishNumber: '140', name: 'Spaghetti Bolognese', price: '12,80 €', allergens: 'a' },
      { id: '141', dishNumber: '141', name: 'Spaghetti Napoli', price: '10,80 €', allergens: 'a', vegetarian: true },
      { id: '142', dishNumber: '142', name: 'Kritharaki mit Hackfleisch', description: 'griechische Reisnudeln', price: '14,80 €', allergens: 'a' },
      { id: '143', dishNumber: '143', name: 'Kritharaki mit Garnelen', price: '18,80 €', allergens: 'a, b' },
      { id: '144', dishNumber: '144', name: 'Kritharaki mit Gemüse', price: '13,80 €', allergens: 'a', vegetarian: true },
      { id: '145', dishNumber: '145', name: 'Pastitsio', description: 'griechischer Nudelauflauf mit Hackfleisch', price: '14,80 €', allergens: 'a, g' },
      { id: '146', dishNumber: '146', name: 'Spaghetti mit Garnelen', price: '18,80 €', allergens: 'a, b' },
    ],
  },
  {
    id: 'kinder',
    name: 'Kindergerichte',
    description: 'Für unsere kleinen Gäste (bis 12 Jahre)',
    items: [
      { id: '150', dishNumber: '150', name: 'Gyros mit Pommes', price: '8,80 €', allergens: 'g' },
      { id: '151', dishNumber: '151', name: 'Suflaki mit Pommes', price: '8,80 €' },
      { id: '152', dishNumber: '152', name: 'Schnitzel mit Pommes', price: '8,80 €', allergens: 'a' },
      { id: '153', dishNumber: '153', name: 'Spaghetti Bolognese', price: '8,30 €', allergens: 'a' },
      { id: '154', dishNumber: '154', name: 'Spaghetti Napoli', price: '7,60 €', allergens: 'a', vegetarian: true },
      { id: '155', dishNumber: '155', name: 'Chicken Nuggets mit Pommes', price: '8,80 €', allergens: 'a' },
    ],
  },
  {
    id: 'beilagen',
    name: 'Beilagen',
    items: [
      { id: '160', dishNumber: '160', name: 'Pommes Frites', price: '3,90 €', vegetarian: true },
      { id: '161', dishNumber: '161', name: 'Reis', price: '3,80 €', vegetarian: true },
      { id: '162', dishNumber: '162', name: 'Bratkartoffeln', price: '4,80 €', vegetarian: true },
      { id: '163', dishNumber: '163', name: 'Folienkartoffel', description: 'mit Kräuterbutter', price: '4,80 €', allergens: 'g', vegetarian: true },
      { id: '164', dishNumber: '164', name: 'Kartoffeln aus dem Ofen', price: '4,80 €', vegetarian: true },
      { id: '165', dishNumber: '165', name: 'Gemischtes Gemüse', price: '4,80 €', vegetarian: true },
      { id: '166', dishNumber: '166', name: 'Pita', price: '2,50 €', allergens: 'a', vegetarian: true },
    ],
  },
  {
    id: 'saucen',
    name: 'Saucen',
    items: [
      { id: '170', dishNumber: '170', name: 'Tzatziki', price: '3,50 €', allergens: 'g', vegetarian: true },
      { id: '171', dishNumber: '171', name: 'Metaxasauce', price: '3,50 €', allergens: 'g', vegetarian: true },
      { id: '172', dishNumber: '172', name: 'Kräuterbutter', price: '2,50 €', allergens: 'g', vegetarian: true },
      { id: '173', dishNumber: '173', name: 'Knoblauchsauce', price: '3,50 €', allergens: 'g', vegetarian: true },
      { id: '174', dishNumber: '174', name: 'Tomatensauce', price: '3,00 €', vegetarian: true },
      { id: '175', dishNumber: '175', name: 'Schafskäsesauce', price: '3,50 €', allergens: 'g', vegetarian: true },
    ],
  },
  {
    id: 'desserts',
    name: 'Nachspeisen',
    items: [
      { id: '180', dishNumber: '180', name: 'Galaktoboureko', description: 'Blätterteig mit Grießpudding und Sirup', price: '7,20 €', allergens: 'a, g', vegetarian: true },
      { id: '181', dishNumber: '181', name: 'Baklava', description: 'Blätterteig mit Nüssen und Honig', price: '7,20 €', allergens: 'a, h', vegetarian: true },
      { id: '182', dishNumber: '182', name: 'Joghurt mit Walnüssen', description: 'griechischer Joghurt mit Honig', price: '6,50 €', allergens: 'g, h', vegetarian: true },
      { id: '183', dishNumber: '183', name: 'Eis', description: '3 Kugeln nach Wahl', price: '5,80 €', allergens: 'g', vegetarian: true },
      { id: '184', dishNumber: '184', name: 'Schokoladenkuchen', description: 'warm, mit Vanilleeis', price: '8,20 €', allergens: 'a, g', vegetarian: true },
      { id: '185', dishNumber: '185', name: 'Loukoumades', description: 'griechische Teigbällchen mit Honig und Zimt', price: '7,80 €', allergens: 'a', vegetarian: true },
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
