# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

## [1.5.0] - 2026-03-07

### ✨ Neue Features
- 🔍 **Speisekarten-Suche**: Gäste können jetzt nach Gerichten suchen (Name und Beschreibung, ab 2 Zeichen)
- 🏷️ **Kategorie-Hinweise**: Aufpreis-Hinweise (z.B. „Bauernsalat + 1,50€") werden goldfarben hervorgehoben
- 🥬 **Vegetarisch-Markierungen**: Gerichte 142 und 146 korrekt als vegetarisch markiert
- 📋 **Gerichtnummern ergänzt**: Fehlende Nummern (110–114) in der Kategorie „Vegetarisch" nachgetragen

### 🐛 Bugfixes
- 🏠 **Hero-Bereich**: Doppelten „in Ganderkesee"-Text entfernt – wird jetzt nur einmal in Gold angezeigt

### 🔧 Technisch
- Neue Komponente `MenuSearch` für die Suchfunktion
- `MenuSection` um Such-Logik mit `useMemo` erweitert
- Datenbank-Migration für vegetarische Flags und Gerichtnummern

## [1.4.0] - 2026-02-01

### 🛡️ Audit & Qualitätssicherung
- 🔐 **Sicherheits-Audit abgeschlossen**: RLS-Policies und Edge-Functions (`login-rate-limited`) verifiziert
- 🤖 **Automatisierung**: Scripts für Admin-Erstellung (`create-admin.mjs`) und E2E-Tests (`e2e-test.mjs`) hinzugefügt
- ✅ **Test-Abdeckung**: Integrationstests für Admin-Login ergänzt, Unit-Tests für alle Admin-Komponenten gefixt
- 🐛 **Bugfixes**: Mocking-Probleme in Tests behoben (vi.hoisted), Typisierung verfeinert

## [1.3.2] - 2026-02-01

### ✅ Sprint 2
- any-Typen eliminiert
- Admin Code-Splitting
- Zod-Validierung erweitert
- Tests erweitert/verbessert
- Test-Setup stabilisiert

## [1.3.1] - 2026-02-01

### 📝 Dokumentation
- Projektbericht erstellt
- Aktionsplan erstellt
- MD060 in Projektbericht behoben

## [1.3.0] - 2026-01-31

### ✨ Verbesserungen
- 🧪 **UI-Tests hinzugefügt**: Speisekarte & Wochenangebote werden über React Testing Library abgedeckt
- 🧾 **Menü-Datenprüfung**: Neues Script `test:menu-data` prüft Allergencodes in `menuData.ts`
- 🚨 **Fehleranzeige in der Speisekarte**: Sichtbarer Hinweis mit Retry-Button bei Ladefehlern
- 🔁 **Wochenangebote stabilisiert**: Fehlende Plätze (1–3) werden automatisch angelegt
- 🧭 **Admin-Reihenfolge**: Schnellsteuerung für Hoch/Runter bei Gerichten
- 🧼 **Allergen-Validierung**: Erlaubte Codes werden angezeigt, ungültige werden abgefangen

## [1.2.0] - 2026-01-30

### 🔐 Sicherheit
- **Passwort-Policy verstärkt**: Mindestlänge von 6 auf 8 Zeichen erhöht in der Benutzerverwaltung
- **Sichere Fehlermeldungen**: Neue Utility `src/lib/errorMessages.ts` übersetzt technische Fehler in benutzerfreundliche deutsche Meldungen
- **Error-Handling verbessert**: Alle Admin-Seiten verwenden jetzt das zentrale Error-Mapping:
  - `AdminUsers.tsx` - Benutzererstllung und -löschung
  - `AdminSettings.tsx` - Einstellungen speichern
  - `AdminGallery.tsx` - Bildupload, -bearbeitung, -löschung
  - `AdminMenu.tsx` - Kategorien und Gerichte verwalten
  - `AdminWeeklyOffers.tsx` - Wochenangebote speichern

### 🛠️ Geändert
- Technische Fehlermeldungen werden nicht mehr direkt an Benutzer angezeigt
- Vollständige Fehlerdetails werden in der Browser-Konsole protokolliert (für Debugging)

## [1.1.0] - 2026-01-29

### ⚡ Performance
- **Preconnect-Hints hinzugefügt**: 
  - Supabase API (`uuohpodkgblvjrhvfldl.supabase.co`)
  - Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`)
- **Hero-Bild optimiert**: 
  - Umstellung von CSS-Background auf `<img>` Tag
  - `fetchPriority="high"` für schnelleres Largest Contentful Paint (LCP)
  - `decoding="async"` für nicht-blockierendes Rendering
- **Galerie-Bilder optimiert**:
  - `loading="lazy"` für Bilder außerhalb des Viewports
  - Explizite `width` und `height` Attribute zur Vermeidung von Layout Shifts (CLS)

### ✅ Verbessert
- Network Dependency Tree optimiert (SEO Audit Score verbessert)
- Kritische Request-Ketten reduziert

## [1.0.0] - 2026-01-28

### ➕ Hinzugefügt
- **Öffentliche Website**
  - Hero-Bereich mit animiertem Hintergrund und Call-to-Action
  - Interaktive Speisekarte mit Kategorien und Filterung
  - Wochenangebote-Anzeige mit Preisvergleich
  - Bildergalerie mit Lightbox-Effekt
  - Kontaktbereich mit Öffnungszeiten und Google Maps Integration
  - Cookie-Banner für DSGVO-Konformität
  - Impressum und Datenschutz-Seiten

- **Admin-Dashboard** (`/admin`)
  - Sichere Anmeldung mit E-Mail/Passwort
  - Speisekarten-Verwaltung (CRUD für Kategorien und Gerichte)
  - Wochenangebote-Editor mit 3 Plätzen
  - Galerie-Verwaltung mit Drag-and-Drop Upload
  - Einstellungen für Kontaktdaten und Öffnungszeiten
  - Benutzerverwaltung (nur für Admins)

- **Sicherheit**
  - Rollenbasiertes Zugriffsystem (Admin/Staff)
  - Row-Level Security (RLS) auf allen Tabellen
  - Server-seitige Admin-Verifizierung via Edge Function
  - SECURITY DEFINER Funktionen mit festem search_path

- **Backend (Supabase/Lovable Cloud)**
  - Datenbanktabellen: `menu_categories`, `menu_items`, `weekly_offers`, `gallery_images`, `restaurant_settings`, `user_roles`
  - Storage-Bucket für Galerie-Bilder
  - Edge Function: `verify-admin`

### 🧩 Technische Details
- React 18 mit TypeScript
- Vite als Build-Tool
- Tailwind CSS mit shadcn/ui Komponenten
- Supabase Client für Datenbankoperationen
- React Query für Server-State-Management
