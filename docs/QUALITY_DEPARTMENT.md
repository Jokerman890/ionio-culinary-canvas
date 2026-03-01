# Quality Department — Ionio Culinary Canvas

Diese QA-Abteilung prüft die Website systematisch über Browser, Viewports und Kernflüsse.

## Mission
- Regressionen früh erkennen
- UI/UX auf Desktop + Mobile sichern
- Login/Admin/Public-Flows regelmäßig gegenchecken

## Team (virtuell)
1. **QA Lead**
   - pflegt Teststrategie, Entry/Exit-Kriterien
2. **Cross-Browser Engineer**
   - Chromium/Firefox/WebKit Matrix
3. **Mobile QA Engineer**
   - iPhone/Android Viewports + Interaktionen
4. **Accessibility/Content QA**
   - Labels, Fokus, Basiskontrollen
5. **Release QA Gatekeeper**
   - GO/NO-GO vor Release

## Testmatrix
- Browser: Chromium, Firefox, WebKit
- Formfaktoren:
  - Desktop 1440x900
  - Tablet 768x1024
  - Mobile 390x844 (iPhone 12)
  - Mobile 412x915 (Pixel 7)

## Kernflows
- Public Home lädt + Hero sichtbar
- Navigation zur Speisekarte
- Login-Seite renderbar
- Submit mit Test-Credentials
- Protected Route `/admin/menu` erreichbar (wenn Session), sonst erwartete Schutzreaktion

## Artefakte
- `qa/reports/qa-summary.json`
- `qa/reports/*.png` (Screenshots je Testfall)

## Gate-Kriterien (Release)
- Build erfolgreich
- Unit/Integration: grün
- QA-Matrix: keine P0
- Sicherheits-Alerts: keine offenen high/critical

## Sicherheit & Credentials
- Test-Credentials nur für Test/Stage verwenden.
- Keine Produktiv-Accounts in Doku oder Code.
- Siehe: `docs/TEST_USERS.md`
