# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

## [1.10.0] - 2026-04-28

### 🔐 Auth / OAuth
- Production Admin OAuth von Lovable Cloud Broker auf direkte Supabase OAuth-Flows umgestellt.
- `/~oauth/initiate` wird in Production nicht mehr verwendet.
- Google/Apple Login startet über Supabase Auth `/auth/v1/authorize`.

### 🚀 Deployment / DevOps
- Manuellen GitHub Actions Workflow zum Deployen der Supabase Edge Functions ergänzt.
- Workflow deployed `login-rate-limited`, `verify-admin` und `manage-users`.
- CORS-Verifikation für Hauptdomain und `www` ergänzt.

### 🧾 Dokumentation
- Hostinger-/Supabase-Auth-Doku erweitert.
- Supabase Redirect URLs, Provider Callback URLs, Edge Function Redeploy und Admin-Rollen-Diagnose dokumentiert.

### ✅ Qualitätssicherung
- AdminLogin/Auth-Tests aktualisiert.
- AdminGallery-Test an aktuellen Standardbilder-Import-State angepasst.
- Vollständige Tests grün dokumentiert.

### ⚠️ Betreiberhinweis
- `SUPABASE_ACCESS_TOKEN` muss als GitHub Actions Secret gesetzt werden, bevor der Function-Deploy-Workflow genutzt werden kann.
- Supabase Provider Callback bleibt: `https://mfhjnxzleewxzglkbjnz.supabase.co/auth/v1/callback`

## [1.9.0] - 2026-04-27

### 🚀 Environment-Migration (Test → Live)
- 🔁 **Production-Domain auf Hostinger/Supabase ausgerichtet**: Die Live-Site `https://ionio-ganderkesee.de/` nutzt das Supabase-Projekt `mfhjnxzleewxzglkbjnz` mit den vollständigen Inhalten (27 Kategorien, 201 Gerichte, 6 Galerie-Bilder).
- 🛟 **Backup erstellt** vor der Migration: `/mnt/documents/live-backup-pre-migration.sql` (Snapshot der alten Live-DB als Rollback-Quelle).
- 📄 **Migrationsbericht** dokumentiert unter `/mnt/documents/migration-report.md` (Vergleich Test vs. Live, Schritte, Ausschlüsse).
- ⚙️ **Strategie**: Das Frontend wird für die Production-Domain gebaut und per VPS-Deployment nach `/opt/ionio-culinary-canvas/dist` ausgeliefert.
- 🔐 **`user_roles` bewusst nicht migriert**: Auth-User existieren nur im jeweiligen Projekt. Admin-Rollen müssen nach erstem Login in Live neu zugewiesen werden.
- 📌 **Wochenangebote**: Datensätze sind vorhanden, jedoch standardmäßig `is_active = false`. Aktivierung über Admin-Dashboard.

### 📝 Dokumentation
- 📚 Migrationsplan in `.lovable/plan.md` finalisiert (Analyse, Backup-Strategie, Risiken, Sicherheits-Garantien).
- 🧾 README & CHANGELOG mit Live-Datenbank-Hinweisen und neuer Version aktualisiert.
- 🆙 `package.json` Version auf **1.9.0** angehoben.

### ✅ Aktion für Betreiber
1. VPS-Deployment ausführen, um den aktuellen Frontend-Build live zu schalten.
2. Hard-Reload auf `https://ionio-ganderkesee.de/` (`Cmd+Shift+R` / `Ctrl+Shift+R`).
3. Mit Apple/Google in Live einloggen → Bescheid geben für Admin-Rollen-Zuweisung.
4. Wochenangebote bei Bedarf im Admin aktivieren.

## [1.8.2] - 2026-04-22

### 🔧 Build / Tooling
- 🧩 **Vite-Version vereinheitlicht**: `vite` auf `5.4.19` gepinnt, um doppelte Vite-Instanzen in `node_modules` zu eliminieren
  - Behebt TypeScript-Fehler **TS2769** in `vite.config.ts` (inkompatible `PluginOption`-Typen aus zwei Vite-Versionen)
  - `plugins`-Array wird explizit als `PluginOption[]` typisiert (`import type { PluginOption } from "vite"`)
  - Vorheriger `as any`-Workaround entfernt – saubere Typisierung wiederhergestellt
- 🚀 **Kompatibilität bestätigt**: `@vitejs/plugin-react-swc` und `lovable-tagger` laufen stabil mit Vite 5.4.19

### 📝 Hinweise
- Frontend-Änderungen werden per GitHub Actions auf den Hostinger VPS deployed
  - Preview kann über Vercel laufen
  - Production-URL ist `https://ionio-ganderkesee.de/`
- Keine Datenbank-Migrationen, keine UI-/UX-Änderungen, rein technischer Wartungs-Release

## [1.8.1] - 2026-04-22

### ⚡ Performance / SEO
- 🚀 **LCP optimiert**: Cookie-Banner wird nicht mehr als Largest Contentful Paint erkannt
  - `CookieBanner` nutzt `requestIdleCallback` (Timeout 3500 ms) bzw. `setTimeout` (3000 ms) als Fallback
  - Banner erscheint erst nach dem LCP-Messfenster → keine künstliche „Element render delay" mehr
- 🌐 **Network Dependency Tree verkürzt**: Analytics-Tracking blockiert nicht mehr die kritische Ladekette
  - `usePageTracking` verschiebt den `page_views`-Insert per `requestIdleCallback` (Timeout 4000 ms) bzw. `setTimeout` (2500 ms)
  - Initialer Request-Tree für LCP/CSS/JS wird nicht mehr durch anonymes Tracking verlängert

### 🛡️ Sicherheit / Admin
- 👤 **Admin-Konto manuell bereitgestellt**: `xristin777@gmail.com` wurde als Administrator angelegt
  - Einmalige Bootstrap-Edge-Function genutzt (Service-Role) und nach Erfolg wieder entfernt
  - Eintrag in `public.user_roles` mit Rolle `admin`
  - Empfehlung: Passwort nach erstem Login ändern

### 🔧 Technisch
- Keine Datenbank-Migrationen erforderlich
- Keine Änderung an Design oder UX – rein technische Deferral-Optimierungen
- `supabase/config.toml` nach Bootstrap auf den vorherigen Stand zurückgesetzt

## [1.8.0] - 2026-03-20

### 🛡️ Sicherheit
- 🔒 **Serverseitiges Rate Limiting**: Brute-Force-Schutz über Datenbank-Funktionen statt clientseitiger Logik
  - Neue Tabelle `login_attempts` speichert alle Anmeldeversuche mit Zeitstempel
  - DB-Funktion `check_login_rate_limit()` prüft max. 5 fehlgeschlagene Versuche pro 5 Minuten (pro E-Mail)
  - DB-Funktion `record_login_attempt()` zeichnet Versuche auf und bereinigt automatisch Einträge älter als 1 Stunde
  - Edge Function `login-rate-limited` gibt HTTP 429 mit Wartezeit bei Überschreitung zurück

### 🔧 Technisch
- `login_attempts`-Tabelle mit RLS (kein Public-Access, nur SECURITY DEFINER)
- Index `idx_login_attempts_identifier_time` für performante Rate-Limit-Abfragen
- Edge Function nutzt `SUPABASE_SERVICE_ROLE_KEY` für DB-Zugriff auf Rate-Limit-Funktionen
- Fail-Open-Strategie: Bei Fehler in der Rate-Limit-Prüfung wird Login dennoch erlaubt

### 🐛 Bugfixes
- 🔄 **OAuth-Weiterleitung**: Apple- und Google-Login leiten jetzt korrekt zum Admin-Dashboard weiter (statt zur Startseite)

## [1.7.0] - 2026-03-18

### ✨ Neue Features
- 🖼️ **Galerie-Verwaltung erweitert**: Feste Website-Bilder sind im Admin sichtbar und können importiert, ersetzt und bearbeitet werden
  - „Standardbilder importieren"-Funktion lädt statische Assets in die Datenbank
  - Bild-Ersetzen-Button für jedes Galerie-Bild (Upload mit Vorschau)
  - Sichtbarkeit, Titel und Beschreibung editierbar
  - Öffentliche Galerie lädt Bilder aus der Datenbank mit Fallback auf statische Assets
- 👁️ **Passwort-Sichtbarkeit**: Auge-Icon im Admin-Login zum Ein-/Ausblenden des Passworts
- 🔑 **Passwort-Vergessen-Flow**: Komplette Implementierung mit E-Mail-Link und Reset-Seite
  - „Passwort vergessen?"-Link im Login-Formular
  - Eigene Seite `/admin/forgot-password` für Reset-Anfrage
  - Seite `/reset-password` zum Setzen eines neuen Passworts

### 🔧 Technisch
- Neue Routen: `/admin/forgot-password`, `/reset-password`
- Supabase Storage-Integration für Galerie-Uploads (max 5 MB)
- `GallerySection` nutzt jetzt `gallery_images`-Tabelle mit statischem Fallback
- Passwort-Recovery über `supabase.auth.resetPasswordForEmail` und `PASSWORD_RECOVERY`-Event

### 🛡️ Sicherheit
- Passwort-Reset nur über verifizierte E-Mail-Adressen
- Galerie-Uploads auf Bildformate und 5 MB begrenzt

## [1.6.0] - 2026-03-08

### ✨ Neue Features
- 📊 **Analyse-Dashboard**: Neuer Admin-Bereich mit umfassenden Besucherstatistiken
  - Seitenaufrufe, eindeutige Besucher, Tages-/Stunden-Verteilung
  - Geräte- und Browser-Aufschlüsselung (Donut- & Balkendiagramme)
  - Beliebteste Seiten mit Fortschrittsbalken
  - Zeitraumfilter (7, 30, 90 Tage)
- 👥 **Verbesserte Benutzerverwaltung**:
  - E-Mail-Adressen werden jetzt angezeigt (statt gekürzte User-IDs)
  - Rollen können direkt geändert werden (Admin ↔ Mitarbeiter)
  - Neue Edge Function `manage-users` für sichere serverseitige Benutzerabfragen
- 🔢 **Gerichtsnummern im Admin**: Feld „Nr." im Gericht-Dialog zum Anlegen/Bearbeiten hinzugefügt
- 📈 **Erweitertes Dashboard**: Wochenangebote-Status, Warnhinweise (nicht verfügbare Gerichte, ausgeblendete Bilder), mehr Schnellzugriffe

### 🔧 Technisch
- `page_views`-Tabelle mit RLS und Indizes für performante Abfragen
- `get_analytics_summary()` DB-Funktion (SECURITY DEFINER) für aggregierte Statistiken
- `usePageTracking`-Hook für automatisches, anonymes Seitenaufruf-Tracking
- Edge Function `manage-users` mit Admin-Verifizierung und CORS
- Recharts-Charts für Datenvisualisierung im Analyse-Bereich
- Admin-Navigation um „Analyse"-Eintrag mit BarChart3-Icon erweitert

### 🛡️ Sicherheit
- Analytics-Insert ist bewusst öffentlich (anonymes Tracking), Lesezugriff nur für Admin/Staff
- Rollenänderungen über Edge Function mit serverseitiger Admin-Prüfung
- Selbst-Degradierung von Admins serverseitig verhindert

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
  - Supabase API (`mfhjnxzleewxzglkbjnz.supabase.co`)
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
