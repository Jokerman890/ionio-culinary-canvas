# Migrationsplan: TEST → LIVE

## 1. Analyse-Ergebnis (Dry-Run)

| Tabelle | TEST | LIVE | Aktion |
|---|---|---|---|
| `menu_categories` | **27** | 8 | Merge: 19 neue + 5 Umbenennungen/Sort-Updates |
| `menu_items` | **201** | 49 | Merge: ~152 neue, alte ID-Kollisionen via UPSERT |
| `weekly_offers` | 3 (alle inaktiv, Position 1 = "Breger Suppe") | 3 (Platzhalter, aktiv) | Upsert per ID — Test-Daten gewinnen |
| `gallery_images` | **6** | 0 | Vollständig kopieren |
| `restaurant_settings` | 3 (`is_public=true`) | 3 (`is_public=false` ⚠️ deshalb leer in Live-Frontend!) | Upsert per `key` |
| `user_roles` | 5 admins | 0 | **Nicht migrieren** (auth.users existieren in Live nicht) |
| Storage `gallery` Bucket | 6 Dateien (~970 KB) | Bucket existiert, **0 Dateien** | Dateien kopieren |

**Wichtige Erkenntnisse:**
- `restaurant_settings.is_public` ist in Live `false` — deshalb sieht die Live-Seite keine Öffnungszeiten/Adresse. Wird auf `true` gesetzt.
- Galerie-`image_url` zeigt aktuell auf den Test-Projekt-Host (`mfhjnxzleewxzglkbjnz.supabase.co`). Da Live ein eigenes Projekt mit eigenem Host ist, müssen URLs nach dem Datei-Upload **auf den Live-Host umgeschrieben** werden.
- `user_roles` werden **nicht** kopiert — die referenzierten Auth-User existieren in der Live-Auth-DB nicht. Admin-Accounts müssen sich in Live einmal einloggen, dann manuell Rollen zuweisen.

## 2. Backup-Strategie (vor jeder Schreiboperation)

Bevor Live verändert wird, exportiere ich **alle aktuellen Live-Daten** als SQL-Restore-Datei nach `/mnt/documents/live-backup-<timestamp>.sql`:
- Vollständiger Snapshot von `menu_categories`, `menu_items`, `weekly_offers`, `gallery_images`, `restaurant_settings`, `user_roles` als `INSERT`-Statements
- Listing aller Storage-Objekte in Live `gallery` (aktuell 0)
- Bei Bedarf jederzeit re-importierbar

## 3. Migrationsschritte (Reihenfolge wichtig wegen FK)

**Schritt A — Backup**
- Live-Daten als SQL-Dump nach `/mnt/documents/live-backup-pre-migration.sql`
- Ausgabe der Zeilenzahlen je Tabelle

**Schritt B — Storage-Migration**
1. 6 Dateien aus Test-Bucket `gallery` herunterladen (Service-Role)
2. In Live-Bucket `gallery` mit identischen Pfaden hochladen
3. Verifizieren: 6/6 Dateien vorhanden, public-URL erreichbar

**Schritt C — `restaurant_settings`** (keine FK)
- UPSERT per `key`, `is_public=true` setzen

**Schritt D — `menu_categories`** (keine FK, aber von items referenziert)
- UPSERT per `id` (alle 27 Test-IDs einfügen, Live behält die 8 alten IDs zusätzlich falls nicht in Test)
- Da bei Live alle 8 IDs **andere** UUIDs haben als Test → es entstehen 8 alte + 27 neue = **35 Kategorien**
- **Merge-Strategie**: alte 8 Live-Kategorien per Name → Test-ID re-mappen, alte löschen falls leer. **Konkret**: Vor dem Insert lösche ich die 8 Live-Kategorien (sie sind in Test inhaltlich enthalten, nur unter neuen IDs), aber erst nachdem geprüft wurde, dass keine `menu_items` in Live darauf verweisen, die nicht migriert werden. Da auch `menu_items` komplett neu kommen, ist Cascade-Delete der alten 8 Live-Kategorien sicher.

**Schritt E — `menu_items`** (FK → categories)
- Vorher: alte 49 Live-Items löschen (sind in Test-Set inhaltlich enthalten)
- Dann 201 Test-Items einfügen mit Original-IDs

**Schritt F — `weekly_offers`** (keine FK)
- UPSERT per `id` — Test-Werte überschreiben Live-Platzhalter

**Schritt G — `gallery_images`** (keine FK)
- INSERT der 6 Test-Zeilen mit umgeschriebenen `image_url` (Live-Host statt Test-Host)

**Schritt H — Verifikation**
- Counts in Live = Counts in Test
- Stichprobe: `restaurant_settings.is_public=true`, eine Galerie-URL via curl prüfen
- Live-App `/` und `/admin` öffnen, Speisekarte/Galerie sichtbar

**Schritt I — Migrationsbericht** nach `/mnt/documents/migration-report.md`

## 4. Was du nach der Migration noch tun musst

1. **Publish → Update** klicken (falls noch Frontend-Änderungen ausstehen)
2. **Admin-Accounts in Live anlegen**: Die 5 Test-Admins existieren in Live nicht in `auth.users`. Du musst dich in Live einmal mit deinem Apple/Google-Account einloggen — danach weise ich dir die `admin`-Rolle in Live zu (sag mir Bescheid, wenn du eingeloggt warst).
3. Hard-Reload: `Cmd+Shift+R` auf der Live-Domain

## 5. Sicherheits-Garantien

- ❌ Keine Dummy-Daten
- ❌ Keine Schema-Änderungen (kein ALTER TABLE)
- ❌ Keine Auth-User-Migration
- ❌ Keine Secrets in Klartext
- ✅ Vollständiges SQL-Backup vor jeder Schreiboperation, jederzeit roll-back-fähig
- ✅ Alle FK-Beziehungen werden in korrekter Reihenfolge gehalten
- ✅ UPSERT statt blindem INSERT, wo IDs übereinstimmen

## 6. Risiken & Gegenmaßnahmen

| Risiko | Maßnahme |
|---|---|
| Storage-Upload schlägt fehl | Pro Datei einzeln verifizieren, Abbruch bei Fehler vor DB-Änderung |
| FK-Bruch durch Reihenfolge | Strikte Reihenfolge D→E, alte Items vor alten Kategorien löschen |
| Live-User verlieren Adminzugriff | Werden ohnehin in Live noch nicht existieren — separater manueller Schritt nach Login |
| `valid_from` in `weekly_offers` setzt CURRENT_DATE neu | Explizit aus Test-Wert übernehmen |

---

## 7. Status (2026-04-27) — ABGESCHLOSSEN ✅

- ✅ Analyse durchgeführt (Test vs. Live verglichen)
- ✅ Backup der alten Live-DB erstellt: `/mnt/documents/live-backup-pre-migration.sql`
- ✅ Migrationsbericht erstellt: `/mnt/documents/migration-report.md`
- ✅ Erkenntnis: Live-Domain zeigte auf altes externes Supabase-Projekt (`uuohpodkgblvjrhvfldl`); `.env` ist bereits auf aktuelles Lovable-Cloud-Projekt (`mfhjnxzleewxzglkbjnz`) konfiguriert → kein manueller SQL-Daten-Sync nötig, Wechsel erfolgt durch nächstes Publish.
- ✅ Versionierung auf **1.10.1** angehoben (package.json, CHANGELOG, README).
- ✅ **Nachtrag (2026-05-02)**: Admin-Login-Problem durch RLS-Bypass in `useAuth` behoben (Nutzung von `has_role()` statt direktem Table-SELECT).
- ⏳ Offen für Betreiber: **Publish → Update** klicken, danach Apple/Google-Login in Live für Admin-Rollen-Zuweisung.
