

# Speisekarte komplett mit Gerichtnummern aus PDF aktualisieren

## Ubersicht
Die gesamte Speisekarte wird anhand der hochgeladenen PDF-Karte des IONIO Restaurants uberarbeitet. Jedes Gericht bekommt seine offizielle Nummer (z.B. "5. Tzatziki", "48. Gyros"). Neue Kategorien und Gerichte aus dem PDF werden hinzugefugt.

## Kategorien aus dem PDF (neu strukturiert)

Die bisherigen 8 Kategorien werden auf ca. 16 erweitert:

| Nr | Neue Kategorie | Nummern | Status |
|----|----------------|---------|--------|
| 1 | Suppen | 1-3 | NEU |
| 2 | Kalte Vorspeisen | 5-16 | Ersetzt "Vorspeisen" |
| 3 | Warme Vorspeisen | 20-39 | NEU |
| 4 | Salate | 40-45 | Update |
| 5 | Gyros und Grillgerichte | 48-64 | Ersetzt "Fleischgerichte" |
| 6 | Mix-Teller | 70-79 | NEU |
| 7 | Spezialitaten des Hauses | 80-86 | NEU |
| 8 | Pfannchen | 90-95 | NEU |
| 9 | Wir empfehlen | 100-101 | NEU |
| 10 | Vegetarisch | 110-114 | NEU |
| 11 | Fischgerichte | 120-128 | Update |
| 12 | Fur 2 Personen | 130-132 | NEU |
| 13 | Nudelgerichte | 140-146 | Update |
| 14 | Kindergerichte | 150-155 | Update |
| 15 | Beilagen | 160-166 | Update |
| 16 | Saucen | 170-175 | NEU |
| 17 | Nachspeisen | 180-185 | Update |

## Technische Schritte

### 1. Datenbank-Migration: `dish_number` Spalte hinzufugen
- Neue Spalte `dish_number` (TEXT) zur Tabelle `menu_items` hinzufugen
- Speichert die Gerichtnummer als String (z.B. "48", "130")

### 2. Datenbank: Neue Kategorien anlegen und bestehende umbenennen
- 9 neue Kategorien erstellen (Suppen, Warme Vorspeisen, Mix-Teller, etc.)
- "Vorspeisen" umbenennen zu "Kalte Vorspeisen"
- "Fleischgerichte" umbenennen zu "Gyros und Grillgerichte"
- Sort-Order aller Kategorien anpassen

### 3. Datenbank: Alle Gerichte aus dem PDF eintragen
- Bestehende 49 Gerichte aktualisieren (Nummern, Preise, Beschreibungen)
- Ca. 70 neue Gerichte hinzufugen
- Jedes Gericht mit: `dish_number`, Name, Beschreibung, Preis, Allergene

### 4. Fallback-Daten aktualisieren (`src/data/menuData.ts`)
- Alle neuen Kategorien und Gerichte als Fallback eintragen
- Gerichtnummern als neues Feld `dishNumber` aufnehmen

### 5. TypeScript-Typen erweitern
- `MenuItem` Interface in `useMenuData.ts` um `dish_number` erweitern

### 6. UI anpassen (`MenuSection.tsx`)
- Gerichtnummer vor dem Gerichtnamen anzeigen (z.B. "48. Gyros")
- Sowohl fur Datenbank- als auch Fallback-Darstellung

### Beispiel Darstellung
Vorher: **Gyros** - Zartes Schweinefleisch vom Drehspiess - 14,80 EUR
Nachher: **48. Gyros** - mit gebratenen Zwiebeln und Paprika - 15,90 EUR

