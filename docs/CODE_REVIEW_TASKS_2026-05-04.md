# Codebasis-Review: Konkrete Aufgaben (2026-05-04)

## 1) Aufgabe: Tippfehler korrigieren
**Titel:** Placeholder mit Tippfehler in Passwort-Reset korrigieren

**Beobachtung:** In der Passwort-Reset-Maske steht als Placeholder aktuell „Mindestens 6 Zeichen“. Das ist sprachlich okay, aber im Kontext der globalen Richtlinie ist es fachlich irreführend und wirkt wie ein Copy-Typo gegenüber der 8-Zeichen-Policy.

**Fundstelle:** `src/pages/ResetPassword.tsx`.

**Vorschlag (Akzeptanzkriterien):**
- Placeholder-Text auf die tatsächlich gültige Mindestlänge anpassen.
- Sichttexte in Passwort-Flow (Forgot/Reset) auf Konsistenz prüfen.
- Optional: String zentralisieren (z. B. Konstanten), damit kein erneuter Tipp-/Copy-Fehler entsteht.

---

## 2) Aufgabe: Programmierfehler korrigieren
**Titel:** Passwortlängen-Validierung im Reset-Flow auf Policy-Niveau bringen

**Beobachtung:** Der produktive Reset-Flow akzeptiert ab 6 Zeichen (`password.length < 6`), während die Tests im Repository eine Mindestlänge von 8 Zeichen definieren.

**Fundstellen:**
- `src/pages/ResetPassword.tsx` (Client-Validierung mit 6 Zeichen).
- `src/lib/validation.test.ts` (Passwort-Policy mit 8 Zeichen).

**Risiko:** Inkonsistente Sicherheitsanforderungen, Verwirrung bei Nutzer:innen und ggf. abweichendes Verhalten zwischen UI, Tests und Backend-Policy.

**Vorschlag (Akzeptanzkriterien):**
- Mindestlänge im Reset-Flow auf 8 Zeichen anheben.
- Fehlermeldung/Placeholder entsprechend aktualisieren.
- Falls Supabase/Backend eigene Policy nutzt: explizit dokumentieren und UI daran ausrichten.

---

## 3) Aufgabe: Kommentar/Dokumentation konsistent machen
**Titel:** Dokumentierte Passwort-Policy zentralisieren und eindeutig machen

**Beobachtung:** Die Passwort-Regel ist implizit in Tests dokumentiert, aber nicht als „Single Source of Truth“ im Code oder in den Betriebsdokumenten beschrieben.

**Fundstellen:**
- `src/lib/validation.test.ts` (implizite Policy: min. 8 Zeichen).
- `README.md` (keine klar referenzierte Sicherheitsrichtlinie zur Passwortlänge).

**Vorschlag (Akzeptanzkriterien):**
- Passwort-Policy in einem zentralen Ort dokumentieren (z. B. `docs/SECURITY.md` oder `README.md` Abschnitt „Security Defaults“).
- Codekommentar im Reset-Flow ergänzen, warum genau diese Länge gilt (inkl. Verweis auf Doku).
- Bei Policy-Änderungen: Changelog-Pflicht ergänzen.

---

## 4) Aufgabe: Test verbessern
**Titel:** Trivialen Beispieltest durch echten Verhaltens-Test ersetzen

**Beobachtung:** `src/test/example.test.ts` testet nur `expect(true).toBe(true)` und liefert keinen Qualitätsgewinn.

**Fundstelle:** `src/test/example.test.ts`.

**Vorschlag (Akzeptanzkriterien):**
- Beispieltest entfernen oder ersetzen durch echten, fachlichen Test (z. B. ResetPassword-Validierung).
- Mindestens ein negativer und ein positiver Testfall:
  - `< 8` Zeichen -> Validierungsfehler.
  - `>= 8` Zeichen + gleiche Bestätigung -> Submit möglich.
- Sicherstellen, dass der Test beim Regression-Fall (erneut 6 Zeichen) rot wird.
