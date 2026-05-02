# Release-Prozess

Dieses Projekt nutzt SemVer fuer nachvollziehbare Releases.

## SemVer-Regeln

- MAJOR: Breaking Changes, inkompatible Datenbank-/API-Aenderungen oder grundlegende Aenderungen am Auth-/Rollenmodell.
- MINOR: Neue Features, neue Admin-Funktionen, neue Deploy-/Automation-Funktionen oder groessere Integrationsaenderungen ohne Breaking Change.
- PATCH: Bugfixes, Doku-Fixes, kleine CORS-/Deploy-/Config-Korrekturen und Testfixes ohne Verhaltensaenderung.

## Release-Checkliste

Vor einem Release lokal ausfuehren:

```bash
npm ci
npm run build
npm test
```

## Version anheben

Die Version steht in `package.json` und muss mit `package-lock.json` konsistent bleiben.

Option A:

```bash
npm version minor --no-git-tag-version
```

Option B:

```bash
# package.json manuell anpassen
npm install --package-lock-only
```

Danach `CHANGELOG.md` mit dem neuen Release-Eintrag aktualisieren.

## Pull Request

Release-Aenderungen laufen ueber einen PR gegen `main`. Der PR enthaelt:

- Version bump
- Changelog-Eintrag
- Release-Dokumentation, falls geaendert
- Testergebnisse

Vor dem Merge wird kein Git-Tag und kein GitHub Release erstellt.

## Nach dem Merge

Nach dem Merge auf `main`:

```bash
git switch main
git pull origin main
git tag v1.10.0
git push origin v1.10.0
```

Danach ein GitHub Release fuer den Tag erstellen und den VPS Deploy pruefen.

## Supabase Edge Functions

Wenn Aenderungen unter `supabase/functions/**` enthalten sind, muessen die Supabase Edge Functions separat deployed werden. Dafuer den manuellen GitHub Actions Workflow `Deploy Supabase Edge Functions` starten.

Der Workflow benoetigt das Repository Secret `SUPABASE_ACCESS_TOKEN`. Function Runtime Secrets wie `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` und `SUPABASE_URL` bleiben in den Supabase Project Secrets.
