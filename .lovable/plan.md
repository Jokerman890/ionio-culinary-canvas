# Diagnose: Test- und Live-DB sind identisch

Ich habe Test und Live verglichen — beide enthalten **exakt dieselben Daten**:

| Tabelle | Test | Live |
|---|---|---|
| `menu_categories` | 8 (Vorspeisen, Salate, Fleischgerichte …) | 8 (identisch) |
| `menu_items` | 49 (alle ohne `dish_number`) | 49 (identisch) |
| `weekly_offers` | "Wochenangebot 1/2/3" | identisch |
| `restaurant_settings` | address, phone, opening_hours | identisch |
| `gallery_images` | 0 | 0 |

**Es gibt also nichts zu syncen** — beide DBs haben denselben (alten) Inhalt. Was du in der Preview siehst, ist auch das, was Live ausliefert.

Falls die Live-Seite trotzdem anders aussieht, liegt das an einem von zwei Dingen:

---

## Schritt 1 — Frontend publishen (deine Code-Fixes live bringen)

Mehrere UI-/Auth-Änderungen sind in der Preview, aber **noch nicht** auf Live:
- Favicon- und App-Icon-Setup
- Apple/Google OAuth-Redirect-Fix für Admin-Login
- Login-Weiterleitungs-Fix nach Auth-State-Sync
- Edge-Function-Fix (`login-rate-limited`)

**Aktion:** Klicke oben rechts auf **Publish → Update**. Das deployed den aktuellen Frontend-Code + Edge Functions auf Live. Danach **Hard-Reload** auf der Live-Domain (Cmd+Shift+R).

---

## Schritt 2 — Speisekarte aus dem PDF vollständig einspielen

In `.lovable/plan.md` ist die komplette Überarbeitung der Speisekarte aus dem IONIO-PDF dokumentiert (17 Kategorien, ~120 Gerichte mit offiziellen Nummern wie "48. Gyros"). Diese Migration **wurde nie ausgeführt** — weder in Test noch in Live. Daher zeigt die Karte überall noch den alten Stand mit nur 49 Gerichten ohne Nummern.

Ich werde:

1. **Migration anlegen** (`supabase/migrations/<ts>_seed_menu_from_pdf.sql`):
   - Bestehende `menu_categories` umbenennen ("Vorspeisen" → "Kalte Vorspeisen", "Fleischgerichte" → "Gyros und Grillgerichte")
   - 9 neue Kategorien einfügen (Suppen, Warme Vorspeisen, Mix-Teller, Spezialitäten des Hauses, Pfännchen, Wir empfehlen, Vegetarisch, Für 2 Personen, Saucen)
   - `sort_order` aller Kategorien neu setzen
   - Alle ~120 Gerichte aus dem PDF per **Upsert** einfügen (`ON CONFLICT (name, category_id) DO UPDATE`), so dass bestehende Live-Daten mit gleichem Namen aktualisiert und neue Gerichte ergänzt werden — keine Live-Daten gehen verloren
   - Jedes Gericht erhält `dish_number`, Beschreibung, Preis und Allergene laut PDF

2. **Unique-Constraint sicherstellen**: Falls noch nicht vorhanden, Constraint `UNIQUE(category_id, name)` auf `menu_items` ergänzen, damit der Upsert deterministisch ist.

3. **Wochenangebote optional aktualisieren**: Falls du echte Angebote statt der Platzhalter "Wochenangebot 1/2/3" willst, kann ich die im selben Upsert-Schritt setzen — sag mir die drei Gerichte + Preise, oder ich lasse die Platzhalter für deine Verwaltung im Admin-Dashboard.

4. **Kein Daten-Sync nötig**: Da der Seed über eine Migration läuft, wird er beim Speichern auf **Test** angewandt und beim nächsten **Publish** automatisch auf **Live** ausgeführt — saubere, nachvollziehbare Methode statt manuellem Datentransfer.

5. **Restaurant-Settings**: Bleiben unverändert (Adresse, Telefon, Öffnungszeiten sind in beiden DBs korrekt).

6. **Galerie**: Beide DBs haben 0 Einträge. Bilder müssen manuell im Admin-Dashboard hochgeladen werden — das ist kein Sync-Problem.

---

## Reihenfolge der Ausführung

1. Du klickst **Publish → Update**, damit die bereits gemachten Code-Fixes (Favicons, OAuth-Redirect, Login-Fix) auf Live landen.
2. Ich lege die Speisekarten-Migration an → nach deinem Approval läuft sie auf Test.
3. Du verifizierst in der Preview, dass die neue Karte mit Nummern korrekt erscheint.
4. Du klickst nochmal **Publish → Update** → Migration läuft automatisch auf Live, neue Karte ist überall sichtbar.

---

## Was ich von dir noch brauche

- **Bestätigung**, dass ich die Speisekarte gemäß `.lovable/plan.md` (17 Kategorien, ~120 Gerichte mit Nummern aus PDF) komplett einspielen soll.
- **Hinweis**, ob Wochenangebote-Platzhalter ersetzt werden sollen (und falls ja: welche 3 Gerichte).