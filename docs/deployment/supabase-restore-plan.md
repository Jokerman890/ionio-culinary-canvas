# Supabase Restore- und Migrationsplan

Stand: 2026-05-04

Ziel: Das Ionio/Lovable-Supabase-Backend reproduzierbar in ein neues oder bestehendes Supabase-Projekt übernehmen.

## 1. Ergebnis der Repo-Prüfung

Das Repository enthält eine brauchbare Supabase-Basis:

- `supabase/config.toml` mit Projektbindung `mfhjnxzleewxzglkbjnz`
- `supabase/migrations/` mit Schema-, RLS-, Storage- und Datenkorrektur-Migrationen
- `supabase/functions/` mit Edge Functions
- generierte TypeScript-Typen unter `src/integrations/supabase/types.ts`
- Deploy-Workflow für Edge Functions unter `.github/workflows/deploy-supabase-functions.yml`

Das Repository enthält nicht vollständig:

- aktuelle Live-/Test-Daten aus Tabellen
- echte Auth-User aus `auth.users`
- Passwort-Hashes außer Testdaten
- Storage-Dateien aus dem `gallery` Bucket
- Supabase Auth-/SMTP-/OAuth-Projektkonfiguration
- Supabase Secrets

## 2. Enthaltene Tabellen laut Repo/Types

Aktuelle öffentliche Tabellen laut `src/integrations/supabase/types.ts`:

- `gallery_images`
- `login_attempts`
- `menu_categories`
- `menu_items`
- `page_views`
- `restaurant_settings`
- `user_roles`
- `weekly_offers`

Wichtige Funktionen:

- `has_role`
- `is_admin_or_staff`
- `check_login_rate_limit`
- `record_login_attempt`
- `get_analytics_summary`

## 3. Kritische Migrationshinweise

### 3.1 Test-Admin

Die Migration `20260201180000_create_test_admin.sql` erstellt einen Testuser:

- E-Mail: `admin@test.local`
- Passwort: `password123`
- Rolle: `admin`

Diese Migration ist für Test/Staging geeignet, aber nicht für Produktion. Für Produktion entweder:

- Migration vor dem initialen Produktions-Setup ausschließen, oder
- Testuser nach Restore entfernen, oder
- sofort Passwort/User rotieren.

Empfohlene Produktionsbereinigung:

```sql
DELETE FROM public.user_roles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@test.local'
);

DELETE FROM auth.users
WHERE email = 'admin@test.local';
```

### 3.2 Datenändernde Migrationen

Einige Migrationen führen `UPDATE`/`DELETE` gegen Menü-Daten aus. Diese sind nicht nur Schema-Migrationen. Deshalb gilt:

- Bei vollständigem DB-Dump/Restore von Source nach Target: Repo-Migrationen nicht nochmal blind nachträglich auf bereits restaurierte Daten anwenden.
- Bei Neuaufbau aus Migrations + CSV-Daten: zuerst Schema aufbauen, dann echte Daten importieren.
- Bei bestehendem Zielprojekt vorab prüfen, ob Migrationen bereits angewendet wurden.

### 3.3 Verdächtige Teständerung

Die Migration `20260426210316_7bb08db4-1a0c-481e-b333-f22416f2ecac.sql` setzt:

```sql
UPDATE public.menu_items SET dish_number='TEST-5' WHERE name='Tzatziki';
```

Vor Production-Restore prüfen, ob diese Änderung gewollt ist. Falls nicht, Korrektur-Migration erstellen oder Wert nach Import setzen:

```sql
UPDATE public.menu_items
SET dish_number = '5'
WHERE name = 'Tzatziki' AND dish_number = 'TEST-5';
```

## 4. Ziel-Strategie

### Variante A — echte 1:1-Kopie aus Supabase Source

Nutzen, wenn Zugriff auf die Source-DB `mfhjnxzleewxzglkbjnz` vorhanden ist.

Das ist der sauberste Weg für eine komplette Kopie inklusive Tabelleninhalt und Auth-Daten.

### Variante B — Neuaufbau aus Repo + manueller Datenimport

Nutzen, wenn Source-DB nicht direkt dumpbar ist oder nur Lovable/CSV-Export verfügbar ist.

Das baut Schema, RLS und Functions aus dem Repo auf. Echte Daten werden danach separat importiert.

## 5. Variante A: Vollständiger DB-Dump/Restore

### 5.1 Variablen setzen

```bash
SOURCE_REF="mfhjnxzleewxzglkbjnz"
TARGET_REF="DEIN_ZIEL_PROJECT_REF"

SOURCE_DB_URL="postgresql://postgres:SOURCE_DB_PASSWORD@db.${SOURCE_REF}.supabase.co:5432/postgres"
TARGET_DB_URL="postgresql://postgres:TARGET_DB_PASSWORD@db.${TARGET_REF}.supabase.co:5432/postgres"
```

### 5.2 Source sichern

```bash
mkdir -p supabase-backup
cd supabase-backup

supabase db dump --db-url "$SOURCE_DB_URL" -f roles.sql --role-only
supabase db dump --db-url "$SOURCE_DB_URL" -f schema.sql
supabase db dump --db-url "$SOURCE_DB_URL" -f data.sql --use-copy --data-only
```

Alternative mit `pg_dump`:

```bash
pg_dump "$SOURCE_DB_URL" \
  --format=custom \
  --no-owner \
  --no-acl \
  --file=ionio-source.dump
```

### 5.3 Ziel vorher sichern

```bash
supabase db dump --db-url "$TARGET_DB_URL" -f target-before-schema.sql
supabase db dump --db-url "$TARGET_DB_URL" -f target-before-data.sql --use-copy --data-only
```

### 5.4 In frisches Zielprojekt importieren

Empfohlen: frisches Supabase-Projekt nutzen.

```bash
psql "$TARGET_DB_URL" \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file roles.sql \
  --file schema.sql \
  --file data.sql
```

Oder bei Custom-Dump:

```bash
pg_restore "$TARGET_DB_URL" \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  ionio-source.dump
```

### 5.5 Nach Restore prüfen

```sql
SELECT count(*) FROM auth.users;
SELECT count(*) FROM public.user_roles;
SELECT count(*) FROM public.menu_categories;
SELECT count(*) FROM public.menu_items;
SELECT count(*) FROM public.gallery_images;
SELECT count(*) FROM public.weekly_offers;
SELECT count(*) FROM public.restaurant_settings;
```

Admin-Rollen prüfen:

```sql
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  r.role
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
ORDER BY u.email;
```

## 6. Variante B: Neuaufbau aus Repo

### 6.1 Repo lokal vorbereiten

```bash
git clone https://github.com/Jokerman890/ionio-culinary-canvas.git
cd ionio-culinary-canvas
npm install
npx supabase login
```

### 6.2 Zielprojekt linken

```bash
npx supabase link --project-ref DEIN_ZIEL_PROJECT_REF
```

Falls `supabase/config.toml` noch auf `mfhjnxzleewxzglkbjnz` zeigt, für Zielumgebung nicht dauerhaft im Main überschreiben. Besser: Ziel-Projekt per CLI-Flag oder separatem Branch/Config verwalten.

### 6.3 Schema/Migrationen anwenden

```bash
npx supabase db push --project-ref DEIN_ZIEL_PROJECT_REF
```

Danach prüfen:

```bash
npx supabase db remote commit --project-ref DEIN_ZIEL_PROJECT_REF
```

Nur ausführen, wenn du bewusst den Remote-Stand als Migration-Baseline übernehmen willst.

### 6.4 Echtdaten importieren

Empfohlene Reihenfolge:

1. `auth.users`, falls verfügbar und gewollt
2. `menu_categories`
3. `menu_items`
4. `restaurant_settings`
5. `weekly_offers`
6. `gallery_images`
7. `user_roles`
8. `page_views`, optional
9. `login_attempts`, normalerweise nicht migrieren

Bei CSV-Import Foreign Keys beachten. Bei `user_roles` muss der jeweilige Auth-User bereits existieren.

## 7. Storage migrieren

Der Repo-Stand erstellt den Bucket `gallery` und Policies, aber nicht die Dateien.

Prüfen:

```sql
SELECT id, name, public FROM storage.buckets;
SELECT bucket_id, name, owner, created_at FROM storage.objects WHERE bucket_id = 'gallery';
```

Dateien separat kopieren:

- aus Source-Storage herunterladen
- Ziel-Bucket `gallery` prüfen/anlegen
- Dateien hochladen
- `gallery_images.image_url` prüfen

Wenn öffentliche URLs Source-Ref enthalten, müssen sie auf Ziel-Ref angepasst werden.

Beispielprüfung:

```sql
SELECT id, title, image_url
FROM public.gallery_images
WHERE image_url LIKE '%mfhjnxzleewxzglkbjnz%';
```

## 8. Edge Functions deployen

Vorhandene Functions:

- `login-rate-limited`
- `verify-admin`
- `manage-users`

Deploy:

```bash
npx supabase functions deploy login-rate-limited --project-ref DEIN_ZIEL_PROJECT_REF
npx supabase functions deploy verify-admin --project-ref DEIN_ZIEL_PROJECT_REF
npx supabase functions deploy manage-users --project-ref DEIN_ZIEL_PROJECT_REF
```

Benötigte Runtime-Secrets im Zielprojekt prüfen/setzen:

```bash
npx supabase secrets list --project-ref DEIN_ZIEL_PROJECT_REF

npx supabase secrets set \
  SUPABASE_URL="https://DEIN_ZIEL_PROJECT_REF.supabase.co" \
  SUPABASE_ANON_KEY="DEIN_ANON_KEY" \
  SUPABASE_SERVICE_ROLE_KEY="DEIN_SERVICE_ROLE_KEY" \
  --project-ref DEIN_ZIEL_PROJECT_REF
```

Keine Secret-Werte ins Repo committen.

## 9. Frontend ENV setzen

Die App liest:

```env
VITE_SUPABASE_URL=https://DEIN_ZIEL_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=DEIN_PUBLISHABLE_ODER_ANON_KEY
```

Bei Deployment auf VPS/Hostinger sicherstellen, dass der Build mit den Zielwerten gebaut wird.

## 10. Supabase Auth-Konfiguration

Im Supabase Dashboard setzen:

Site URL:

```text
https://ionio-ganderkesee.de
```

Allowed Redirect URLs:

```text
https://ionio-ganderkesee.de/**
https://www.ionio-ganderkesee.de/**
https://ionio-ganderkesee.de/admin/login
https://ionio-ganderkesee.de/admin
https://ionio-ganderkesee.de/reset-password
http://localhost:5173/**
```

OAuth Provider Callback, z. B. Google:

```text
https://DEIN_ZIEL_PROJECT_REF.supabase.co/auth/v1/callback
```

## 11. Smoke Tests nach Migration

### 11.1 DB-Basis

```sql
SELECT 'menu_categories' AS table_name, count(*) FROM public.menu_categories
UNION ALL SELECT 'menu_items', count(*) FROM public.menu_items
UNION ALL SELECT 'weekly_offers', count(*) FROM public.weekly_offers
UNION ALL SELECT 'restaurant_settings', count(*) FROM public.restaurant_settings
UNION ALL SELECT 'gallery_images', count(*) FROM public.gallery_images
UNION ALL SELECT 'user_roles', count(*) FROM public.user_roles;
```

### 11.2 RLS/Login-Rollen

```sql
SELECT public.has_role(auth.uid(), 'admin'::public.app_role);
SELECT public.is_admin_or_staff(auth.uid());
```

Diese Queries funktionieren sinnvoll nur innerhalb eines authentifizierten Request-Kontexts. Für direkte SQL-Prüfung besser User/Rollen joinen.

### 11.3 Frontend

Prüfen:

- `/admin/login`
- Passwort-Login
- OAuth-Login, falls aktiv
- Passwort-Reset-Mail
- Admin Dashboard
- Menü laden
- Menü bearbeiten
- Gallery Upload
- Weekly Offers
- Analytics

### 11.4 Edge Function CORS

```bash
curl -i -X OPTIONS \
  https://DEIN_ZIEL_PROJECT_REF.supabase.co/functions/v1/login-rate-limited \
  -H "Origin: https://ionio-ganderkesee.de"
```

Erwartet:

```text
HTTP/2 200
access-control-allow-origin: https://ionio-ganderkesee.de
```

## 12. Empfohlene Entscheidung

Für echte Übernahme der Testumgebung:

1. Wenn Source-DB-Zugriff vorhanden: Variante A nutzen.
2. Wenn Source nur über Lovable/CSV erreichbar ist: Variante B nutzen.
3. `login_attempts` und `page_views` nur migrieren, wenn Analytics/Historie wirklich benötigt wird.
4. Testuser aus Produktion entfernen.
5. Storage-Dateien separat kopieren.
6. Auth Redirect URLs nach Zielprojekt neu setzen.
7. Edge Function Secrets im Zielprojekt neu setzen.

## 13. Kurzbefehle für den wahrscheinlich besten Weg

```bash
git clone https://github.com/Jokerman890/ionio-culinary-canvas.git
cd ionio-culinary-canvas
npm install
npx supabase login

SOURCE_REF="mfhjnxzleewxzglkbjnz"
TARGET_REF="DEIN_ZIEL_PROJECT_REF"
SOURCE_DB_URL="postgresql://postgres:SOURCE_DB_PASSWORD@db.${SOURCE_REF}.supabase.co:5432/postgres"
TARGET_DB_URL="postgresql://postgres:TARGET_DB_PASSWORD@db.${TARGET_REF}.supabase.co:5432/postgres"

mkdir -p supabase-backup
cd supabase-backup

supabase db dump --db-url "$SOURCE_DB_URL" -f roles.sql --role-only
supabase db dump --db-url "$SOURCE_DB_URL" -f schema.sql
supabase db dump --db-url "$SOURCE_DB_URL" -f data.sql --use-copy --data-only

psql "$TARGET_DB_URL" --single-transaction --variable ON_ERROR_STOP=1 \
  --file roles.sql \
  --file schema.sql \
  --file data.sql

cd ..

npx supabase functions deploy login-rate-limited --project-ref "$TARGET_REF"
npx supabase functions deploy verify-admin --project-ref "$TARGET_REF"
npx supabase functions deploy manage-users --project-ref "$TARGET_REF"
```
