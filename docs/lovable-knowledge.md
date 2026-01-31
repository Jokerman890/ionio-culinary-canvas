# Custom Knowledge: Ionio Restaurant Website & Admin Dashboard

## Projektüberblick
Ionio ist eine moderne Website für ein griechisches Restaurant mit integriertem Admin-Dashboard. Das Frontend basiert auf React 18, TypeScript und Vite, das Styling erfolgt mit Tailwind CSS und shadcn/ui. Das Backend läuft über Supabase (PostgreSQL, Auth, Storage, RLS, Edge Functions).

## Wichtige Bereiche der Anwendung

### Öffentliche Website
- **Hero-Bereich** mit animiertem Hintergrund und optimierten Ladezeiten.
- **Speisekarte** mit Kategorien, Allergenen und Wochenangeboten.
- **Galerie** mit Lazy-Loading und expliziten Bilddimensionen.
- **Kontaktbereich** mit Öffnungszeiten und Wegbeschreibung.

### Admin-Dashboard (`/admin`)
- **Speisekarten-Verwaltung** (CRUD für Kategorien und Gerichte).
- **Wochenangebote** (bis zu 3 prominente Angebote).
- **Galerie-Verwaltung** (Upload, Sichtbarkeit, Metadaten).
- **Einstellungen** (Kontaktdaten und Öffnungszeiten).
- **Benutzerverwaltung** (Rollen: Admin/Staff).

## Sicherheit & Rollen
- **Rollenmodell**: Admin hat Vollzugriff, Staff eingeschränkten Zugriff.
- **RLS-Policies** sichern alle Tabellen.
- **Edge Function**: `supabase/functions/verify-admin` verifiziert Admins serverseitig.
- **Fehlermeldungen** werden über `src/lib/errorMessages.ts` in nutzerfreundliche deutsche Texte übersetzt.

## Wichtige Code-Pfade
- `src/components/` – UI- und Feature-Komponenten
- `src/pages/` – Seiten inkl. Admin-Ansichten
- `src/contexts/` – Auth- und App-Kontexte
- `src/hooks/` – Custom Hooks
- `src/integrations/` – Supabase Client
- `supabase/functions/` – Edge Functions

## UI/Styling-Konventionen
- UI-Elemente nutzen shadcn/ui Komponenten in `src/components/ui`.
- Styling erfolgt mit Tailwind CSS.
- Responsive Layouts sind Standard.

## Test & Entwicklung
- Lokale Entwicklung: `npm run dev`
- Tests: `npm test`

## Typische Aufgaben
- **Neue Admin-Funktion**: Seite in `src/pages/admin`, Logik in `src/components/admin`.
- **Neue Speisekarten-Features**: Komponenten in `src/components/menu`.
- **Supabase-Änderungen**: Auth/RLS beachten und ggf. Edge Functions ergänzen.
