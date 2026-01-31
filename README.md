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
- **Backend**: Supabase (Lovable Cloud)
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

## 📝 Changelog

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
