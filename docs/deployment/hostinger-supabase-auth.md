# Hostinger Supabase Auth Configuration

This project is deployed as a Vite SPA on the Hostinger VPS and uses Supabase Auth directly. Production OAuth must not use the Lovable Cloud OAuth broker (`/~oauth/initiate`).

## Production Project

- Supabase project ref: `mfhjnxzleewxzglkbjnz`
- Supabase URL: `https://mfhjnxzleewxzglkbjnz.supabase.co`
- Production site URL: `https://ionio-ganderkesee.de`
- Production build path on VPS: `/opt/ionio-culinary-canvas/dist`

## Supabase Auth URL Configuration

Set the Supabase Auth Site URL to:

```text
https://ionio-ganderkesee.de
```

Add these Allowed Redirect URLs in Supabase Authentication -> URL Configuration:

```text
https://ionio-ganderkesee.de/**
https://www.ionio-ganderkesee.de/**
https://ionio-ganderkesee.de/admin/login
https://ionio-ganderkesee.de/admin
https://ionio-ganderkesee.de/reset-password
http://localhost:5173/**
```

Optional preview URLs, if those environments are still used:

```text
https://ionio-culinary-canvas.vercel.app/**
https://ionio-prime-web.lovable.app/**
```

The admin login uses:

```ts
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/admin/login`,
  },
})
```

Supabase will only honor that `redirectTo` value if the resulting URL is allowed in the Supabase Auth redirect allow-list.

## Google And Apple Provider Callback URLs

For Google OAuth, configure this Authorized redirect URI in Google Cloud Console:

```text
https://mfhjnxzleewxzglkbjnz.supabase.co/auth/v1/callback
```

For Apple OAuth, configure the equivalent Sign in with Apple web callback/return URL:

```text
https://mfhjnxzleewxzglkbjnz.supabase.co/auth/v1/callback
```

Important: `https://ionio-ganderkesee.de/admin/login` belongs in Supabase Allowed Redirect URLs. It is not the Google Cloud Console callback URL.

## Edge Function CORS

Browser-invoked Edge Functions must allow the production origins explicitly:

```text
https://ionio-ganderkesee.de
https://www.ionio-ganderkesee.de
http://localhost:5173
```

Preview origins can remain allowed when needed:

```text
https://ionio-culinary-canvas.vercel.app
https://ionio-prime-web.lovable.app
```

Do not use `Access-Control-Allow-Origin: *` for authenticated browser calls.

Edge Function secrets must stay in Supabase project secrets or GitHub/VPS secrets. Never expose `SUPABASE_SERVICE_ROLE_KEY` in the frontend build.

## Redeploy Edge Functions After CORS Changes

Changes in `supabase/functions/_shared/cors.ts` only affect live traffic after the Edge Functions are deployed again to the production Supabase project.

Deploy the browser-invoked functions to project `mfhjnxzleewxzglkbjnz`:

```bash
npx supabase functions deploy login-rate-limited --project-ref mfhjnxzleewxzglkbjnz
npx supabase functions deploy verify-admin --project-ref mfhjnxzleewxzglkbjnz
npx supabase functions deploy manage-users --project-ref mfhjnxzleewxzglkbjnz
```

Before deploying, make sure the Supabase CLI is authenticated via `npx supabase login` or a non-logged `SUPABASE_ACCESS_TOKEN`. Confirm the production function secrets exist without printing their values:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Verify CORS after deployment:

```bash
curl -i -X OPTIONS \
  https://mfhjnxzleewxzglkbjnz.supabase.co/functions/v1/login-rate-limited \
  -H "Origin: https://ionio-ganderkesee.de"

curl -i -X OPTIONS \
  https://mfhjnxzleewxzglkbjnz.supabase.co/functions/v1/login-rate-limited \
  -H "Origin: https://www.ionio-ganderkesee.de"
```

Expected result: each response returns `HTTP 200` and `Access-Control-Allow-Origin` exactly matching the request `Origin`.

## Deploy Edge Functions Via GitHub Actions

Use the manual `Deploy Supabase Edge Functions` workflow when local Supabase CLI login is unavailable or when the functions need to be redeployed after CORS changes.

Create a Supabase access token in Supabase Dashboard -> Account -> Access Tokens -> Generate token. Store it in GitHub as a repository secret:

```text
Repository -> Settings -> Secrets and variables -> Actions -> New repository secret
Name: SUPABASE_ACCESS_TOKEN
```

Then start the workflow manually:

```text
GitHub -> Actions -> Deploy Supabase Edge Functions -> Run workflow
```

The workflow deploys these functions to project `mfhjnxzleewxzglkbjnz`:

```text
login-rate-limited
verify-admin
manage-users
```

It also verifies that `https://www.ionio-ganderkesee.de` receives this CORS response:

```text
Access-Control-Allow-Origin: https://www.ionio-ganderkesee.de
```

Never commit access tokens or service role keys to the repository. Rotate the `SUPABASE_ACCESS_TOKEN` regularly. Runtime function secrets such as `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, and `SUPABASE_URL` stay in Supabase project secrets, not in the frontend build or GitHub Actions workflow.

## Hostinger Nginx SPA Fallback

The VPS serves a static Vite build from `/opt/ionio-culinary-canvas/dist`. Because the app uses React Router `BrowserRouter`, Nginx must serve `index.html` for client-side routes:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

This is the Hostinger/Nginx equivalent of Vercel's SPA rewrite in `vercel.json`.

## Admin Role Diagnosis

If OAuth or password login succeeds but the admin area shows `Kein Zugriff`, the user exists in Supabase Auth but does not have an `admin` or `staff` row in `public.user_roles`.

Check users and roles:

```sql
select
  u.id,
  u.email,
  u.email_confirmed_at,
  r.role
from auth.users u
left join public.user_roles r on r.user_id = u.id
order by u.email;
```

Set an admin role for a known email:

```sql
with target_user as (
  select id
  from auth.users
  where lower(email) = lower('ADMIN_EMAIL_HERE')
),
updated as (
  update public.user_roles
  set role = 'admin'::public.app_role
  where user_id = (select id from target_user)
  returning *
)
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from target_user
where not exists (select 1 from updated);
```
