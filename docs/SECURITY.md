# Sicherheitsdokumentation

Dieses Dokument beschreibt die Sicherheitsarchitektur der Ionio Restaurant Website.

## Übersicht

Die Anwendung implementiert ein mehrschichtiges Sicherheitsmodell:

Secrets und Zugangsdaten (z.B. .env-Dateien) dürfen nicht in das Repository committed werden und müssen lokal bzw. in sicheren Secret-Stores verwaltet werden.

1. **Client-seitige Zugriffskontrolle** (UX-Layer)
2. **Row-Level Security** (Datenbankebene)
3. **Edge Functions** (Server-seitige Validierung)

## Rollenmodell

### Rollen
| Rolle | Beschreibung | Berechtigungen |
|-------|--------------|----------------|
| `admin` | Administrator | Vollzugriff inkl. Benutzerverwaltung |
| `staff` | Mitarbeiter | Speisekarte, Galerie, Einstellungen |

### Rollentabelle
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Row-Level Security (RLS)

### Hilfsfunktionen

```sql
-- Prüft ob Benutzer eine bestimmte Rolle hat
CREATE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Prüft ob Benutzer Admin oder Staff ist
CREATE FUNCTION public.is_admin_or_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'staff')
  )
$$;
```

### Policy-Muster

**Öffentliche Lesezugriffe:**
```sql
CREATE POLICY "Anyone can view" ON table_name
FOR SELECT USING (true);
```

**Staff-Schreibzugriffe:**
```sql
CREATE POLICY "Admin/Staff can insert" ON table_name
FOR INSERT WITH CHECK (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admin/Staff can update" ON table_name
FOR UPDATE USING (is_admin_or_staff(auth.uid()));

CREATE POLICY "Admin/Staff can delete" ON table_name
FOR DELETE USING (is_admin_or_staff(auth.uid()));
```

**Admin-Only Zugriffe:**
```sql
CREATE POLICY "Admins only" ON user_roles
FOR ALL USING (has_role(auth.uid(), 'admin'));
```

## Edge Functions

### verify-admin

Verifiziert serverseitig ob ein Benutzer Admin-Rechte hat.

**Endpoint:** `POST /functions/v1/verify-admin`

**Request:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "isAdmin": true,
  "userId": "uuid"
}
```

**Verwendung im Frontend:**
```typescript
const { isAdmin } = useServerAuth();
```

### login-rate-limited

Login-Proxy mit serverseitigem Rate-Limiting (Schutz gegen Brute-Force-Angriffe).

**Endpoint:** `POST /functions/v1/login-rate-limited`

**Request:**
```json
{
  "email": "admin@ionio-ganderkesee.de",
  "password": "••••••••"
}
```

**Rate-Limit:** 5 Versuche pro 5 Minuten (pro E-Mail + IP).

**Response (Erfolg):**
```json
{
  "data": {
    "session": { "access_token": "..." },
    "user": { "id": "uuid" }
  }
}
```

**Response (Limit erreicht):**
```json
{
  "error": "rate_limited",
  "message": "Zu viele Anmeldeversuche. Bitte später erneut versuchen.",
  "retryAfterMs": 300000
}
```

## Sichere Fehlermeldungen

Technische Fehlermeldungen werden über `src/lib/errorMessages.ts` gefiltert:

```typescript
import { getUserFriendlyError } from '@/lib/errorMessages';

try {
  // Operation
} catch (error) {
  const message = getUserFriendlyError(error, 'context');
  toast({ title: 'Fehler', description: message });
}
```

### Error-Mapping
| Technischer Fehler | Benutzer-Nachricht |
|--------------------|-------------------|
| `duplicate key` | Dieser Eintrag existiert bereits |
| `foreign key violation` | Dieser Eintrag kann nicht gelöscht werden |
| `permission denied` | Keine Berechtigung für diese Aktion |
| `Invalid login credentials` | Ungültige Anmeldedaten |

## Passwort-Policy

- Mindestlänge: **8 Zeichen** (client-seitig)
- Supabase Auth erzwingt zusätzliche server-seitige Regeln

## Checkliste

- [x] RLS auf allen Tabellen aktiviert
- [x] SECURITY DEFINER mit festem search_path
- [x] Server-seitige Admin-Verifizierung
- [x] Keine technischen Fehlermeldungen an Benutzer
- [x] Passwort-Mindestlänge: 8 Zeichen
- [x] CORS-Header in Edge Functions
- [x] JWT-Validierung in Edge Functions
