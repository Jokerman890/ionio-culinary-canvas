# Ionio Restaurant - Website & Admin Dashboard

Eine moderne Restaurant-Website mit integriertem Admin-Dashboard für das griechische Restaurant Ionio in Ganderkesee.

## 🌟 Features

### Öffentliche Website
- **Hero-Bereich** mit animiertem Hintergrund
- **Speisekarte** mit Kategorien, Allergene-Kennzeichnung und Wochenangeboten
- **Galerie** mit Lazy-Loading für optimale Performance
- **Kontaktbereich** mit Öffnungszeiten und Wegbeschreibung
- **SEO-optimiert** mit Preconnect-Hints und optimierten Bildern
- **Responsive Design** für alle Geräte

### Admin-Dashboard (`/admin`)
- **Speisekarten-Verwaltung**: Kategorien und Gerichte erstellen, bearbeiten, löschen
- **Wochenangebote**: 3 prominente Angebotsplätze verwalten
- **Galerie-Verwaltung**: Bilder hochladen, bearbeiten, ein-/ausblenden
- **Einstellungen**: Kontaktdaten und Öffnungszeiten ändern
- **Benutzerverwaltung**: Mitarbeiter-Zugänge verwalten (nur Admins)

### Sicherheit
- **Rollenbasierte Zugriffskontrolle** (Admin/Staff)
- **Server-seitige Validierung** via Edge Functions
- **Row-Level Security (RLS)** für alle Datenbanktabellen
- **Sichere Fehlermeldungen** ohne technische Details

## 🛠 Technologie-Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (`mfhjnxzleewxzglkbjnz`)
  - PostgreSQL Datenbank
  - Row-Level Security
  - Edge Functions (Deno)
  - Storage für Bilder
- **Authentifizierung**: Supabase Auth

## 📁 Projektstruktur

```
src/
├── components/
│   ├── admin/          # Admin-Dashboard Komponenten
│   ├── menu/           # Speisekarten-Komponenten
│   └── ui/             # shadcn/ui Komponenten
├── contexts/           # React Contexts (Auth)
├── hooks/              # Custom React Hooks
├── lib/                # Utility-Funktionen
├── pages/
│   └── admin/          # Admin-Seiten
└── integrations/       # Supabase Client

supabase/
├── functions/
│   └── verify-admin/   # Server-seitige Admin-Verifizierung
└── config.toml         # Supabase Konfiguration
```

## 🔒 Sicherheitsarchitektur

### Rollenmodell
- **Admin**: Vollzugriff inkl. Benutzerverwaltung
- **Staff**: Kann Speisekarte, Galerie und Einstellungen bearbeiten

### Sicherheitsschichten
1. **Client-seitig**: UI-basierte Zugriffsbeschränkung (UX)
2. **RLS-Policies**: Datenbankebene mit `is_admin_or_staff()` Funktion
3. **Edge Functions**: Server-seitige Admin-Verifizierung via `verify-admin`

### Passwort-Policy
- Client-seitige Mindestlaenge: **8 Zeichen**
- Zentrale Policy-Datei: `src/lib/passwordPolicy.ts`
- Diese Policy wird im Passwort-Reset und in der Admin-Benutzerverwaltung verwendet.
- Aenderungen an der Passwort-Policy muessen in `CHANGELOG.md` und `docs/SECURITY.md` dokumentiert werden.

### Fehlermeldungen
Technische Fehler werden über `src/lib/errorMessages.ts` in benutzerfreundliche deutsche Meldungen übersetzt, während Details für Debugging in der Konsole protokolliert werden.

## 🔧 Entwicklung

### Lokale Entwicklung
```bash
npm install
npm run dev
```

### Tests ausführen
```bash
npm test
```

## 🚀 Deployment-Hinweis

Frontend-Änderungen werden über GitHub Actions gebaut und auf den Hostinger VPS nach `/opt/ionio-culinary-canvas/dist` deployed. Die Production-Domain ist `https://ionio-ganderkesee.de/`. Backend-Änderungen an Supabase Edge Functions und Auth-Konfiguration müssen im Supabase-Projekt `mfhjnxzleewxzglkbjnz` deployed bzw. gesetzt werden.

- **Production-URL**: `https://ionio-ganderkesee.de/`
- **VPS-Build-Pfad**: `/opt/ionio-culinary-canvas/dist`
- **Preview-URL** (optional): `https://ionio-culinary-canvas.vercel.app`

## Versionierung

- Dieses Projekt nutzt SemVer.
- Die aktuelle Lockfile-Version steht in `package-lock.json`.
- Security-relevante Bugfixes, Policy-Aenderungen und Testverbesserungen erhalten mindestens einen Patch-Versionseintrag.
- Die aktuelle Version steht in `package.json`.
- Änderungen werden in `CHANGELOG.md` dokumentiert.
- Releases werden über Git-Tags im Format `vX.Y.Z` markiert.

## 📝 Changelog

### Version 1.10.2 (2026-05-04)
**Sicherheit / Qualitaetssicherung**
- Passwort-Reset, Admin-Benutzerverwaltung und Tests nutzen eine zentrale 8-Zeichen-Policy.
- Dummy-Test durch fachlichen Passwort-Policy-Test ersetzt.
- Security-Dokumentation um Policy-Quelle und Changelog-Pflicht ergaenzt.

### Version 1.10.1 (2026-05-02)
**🐛 Bugfixes**
- Admin-Login RLS Deadlock behoben durch Nutzung der `has_role()` RPC-Funktion zum Umgehen der RLS-Policy.

### Version 1.10.0 (2026-04-28)
**🚀 Environment-Migration (Test → Live)**
- 🔁 Production-Domain `https://ionio-ganderkesee.de/` nutzt das Supabase-Projekt `mfhjnxzleewxzglkbjnz`
- 📦 Vollständige Inhalte nun live: 27 Kategorien, 201 Gerichte, 6 Galerie-Bilder
- 🛟 Backup der alten Live-DB unter `/mnt/documents/live-backup-pre-migration.sql`
- 📄 Migrationsbericht unter `/mnt/documents/migration-report.md`
- 🔐 `user_roles` nicht migriert — Admin-Rollen nach erstem Login in Live neu zuweisen
- ✅ Aktion: VPS-Deployment ausführen + Hard-Reload auf `https://ionio-ganderkesee.de/`

### Version 1.8.2 (2026-04-22)
**🔧 Build/Tooling**
- 🧩 Vite auf 5.4.19 gepinnt – doppelte Vite-Instanzen entfernt
- ✅ TypeScript-Fehler **TS2769** in `vite.config.ts` behoben
- 🧼 `as any`-Workaround durch sauberes `PluginOption[]` ersetzt

### Version 1.8.1 (2026-04-22)
**⚡ Performance / SEO**
- 🚀 Cookie-Banner & Analytics-Tracking via `requestIdleCallback` deferred (LCP-Optimierung)
- 👤 Admin-Konto `xristin777@gmail.com` bereitgestellt

### Version 1.8.0 (2026-03-20)
**🛡️ Sicherheit**
- 🔒 Serverseitiges Login-Rate-Limiting (5 Versuche / 5 Min) via Edge Function `login-rate-limited`
- 🔄 OAuth-Weiterleitung (Google/Apple) korrigiert

### Version 1.7.0 (2026-03-18)
**✨ Features**
- 🖼️ Galerie-Verwaltung erweitert (Standardbilder importieren, Ersetzen)
- 👁️ Passwort-Sichtbarkeit im Login
- 🔑 Passwort-vergessen-Flow inkl. Reset-Seite

### Version 1.6.0 (2026-03-08)
**📊 Analyse-Dashboard**
- 📈 Besucherstatistiken, Geräte/Browser, Top-Seiten
- 👥 Benutzerverwaltung mit E-Mail-Anzeige & Rollenwechsel via Edge Function `manage-users`
- 🔢 Gerichtsnummern im Admin

### Version 1.5.0 (2026-03-07)
**🔍 Speisekarte**
- 🔍 Such-Funktion (Name + Beschreibung)
- 🏷️ Aufpreis-Hinweise (gold)
- 🥬 Vegetarisch-Markierungen + fehlende Gerichtnummern

### Version 1.4.0 (2026-02-01)
**🛡️ Audit & Tests**
- ✅ Umfassendes Code-Audit durchgeführt
- 🤖 E2E-Testskripte für Admin-Bereich hinzugefügt
- 🔐 Sicherheits-Check (RLS, Rate-Limiting) erfolgreich
- 🐛 Unit- und Integrationstests stabilisiert



### Version 1.3.0 (2026-01-31)
**✨ Verbesserungen**
- 🧪 **UI-Tests** für Speisekarte und Wochenangebote ergänzt
- 🧾 **Menü-Datenprüfung** per Script (`test:menu-data`) für Allergencodes
- 🚨 **Fehleranzeige** mit Retry-Button in der öffentlichen Speisekarte
- 🔁 **Wochenangebote**: fehlende Plätze werden automatisch angelegt
- 🧭 **Admin-Sortierung**: schnelle Hoch/Runter-Reihenfolge bei Gerichten
- 🧼 **Allergen-Validierung** mit erlaubten Codes in der Admin-Eingabe

### Version 1.2.0 (2026-01-30)
**🔐 Sicherheitsverbesserungen**
- 🔑 Passwort-Mindestlänge von 6 auf 8 Zeichen erhöht
- 🧩 Neue Error-Mapping-Utility für sichere Fehlermeldungen
- 🧑‍💻 Alle Admin-Seiten verwenden jetzt benutzerfreundliche Fehlermeldungen

### Version 1.1.0 (2026-01-29)
**⚡ Performance-Optimierungen**
- 🔗 Preconnect-Hints für Supabase API und Google Fonts
- 🖼️ Hero-Bild mit `fetchPriority="high"` für schnelleres LCP
- 🧭 Galerie-Bilder mit Lazy-Loading und expliziten Dimensionen

### Version 1.0.0 (2026-01-28)
**🚀 Initiale Version**
- 🌍 Öffentliche Restaurant-Website
- 🛠️ Admin-Dashboard mit Speisekarten-Verwaltung
- 🖼️ Galerie-Verwaltung mit Bildupload
- 👥 Benutzerverwaltung mit Rollenmodell
- ✅ Server-seitige Admin-Verifizierung

## 📄 Lizenz

Dieses Projekt wurde mit [Lovable](https://lovable.dev) erstellt.
