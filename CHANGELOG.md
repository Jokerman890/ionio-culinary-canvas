# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

## [1.2.0] - 2026-01-30

### Sicherheit
- **Passwort-Policy verstärkt**: Mindestlänge von 6 auf 8 Zeichen erhöht in der Benutzerverwaltung
- **Sichere Fehlermeldungen**: Neue Utility `src/lib/errorMessages.ts` übersetzt technische Fehler in benutzerfreundliche deutsche Meldungen
- **Error-Handling verbessert**: Alle Admin-Seiten verwenden jetzt das zentrale Error-Mapping:
  - `AdminUsers.tsx` - Benutzererstllung und -löschung
  - `AdminSettings.tsx` - Einstellungen speichern
  - `AdminGallery.tsx` - Bildupload, -bearbeitung, -löschung
  - `AdminMenu.tsx` - Kategorien und Gerichte verwalten
  - `AdminWeeklyOffers.tsx` - Wochenangebote speichern

### Geändert
- Technische Fehlermeldungen werden nicht mehr direkt an Benutzer angezeigt
- Vollständige Fehlerdetails werden in der Browser-Konsole protokolliert (für Debugging)

## [1.1.0] - 2026-01-29

### Performance
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

### Verbessert
- Network Dependency Tree optimiert (SEO Audit Score verbessert)
- Kritische Request-Ketten reduziert

## [1.0.0] - 2026-01-28

### Hinzugefügt
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

### Technische Details
- React 18 mit TypeScript
- Vite als Build-Tool
- Tailwind CSS mit shadcn/ui Komponenten
- Supabase Client für Datenbankoperationen
- React Query für Server-State-Management
