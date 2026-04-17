# Vercel Deployment

This project deploys to Vercel from the `main` branch. The production build must succeed with `typescript.ignoreBuildErrors: false` and `eslint.ignoreDuringBuilds: false`.

## Required Environment Variables

Configure these in **Vercel → Project → Settings → Environment Variables** for the Production, Preview, and Development environments. Names and expected values are mirrored in [`.env.example`](./.env.example).

| Variable                           | Purpose                                                                 |
|------------------------------------|-------------------------------------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`         | Public Supabase project URL                                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`    | Public Supabase anon key (client-side reads)                            |
| `SUPABASE_SERVICE_ROLE_KEY`        | **Server-only** Supabase service-role key (bypasses RLS; never expose)  |
| `JWT_SECRET`                       | Random ≥32-char secret used to sign `auth-token` cookies                |
| `NEXT_PUBLIC_APP_URL`              | Public URL of the deployment (e.g. `https://g1000.vercel.app`)          |
| `SENDGRID_API_KEY`                 | SendGrid API key for transactional email (optional in Preview)          |

Do not commit any of the real values. Pull them from `.env.local` (local dev) or the Vercel dashboard (deployed environments).

## Deployment Steps

1. Push to `main` (or open a PR for a Preview deployment).
2. Ensure every variable above is set in the target Vercel environment.
3. Wait for the build to finish; confirm it completes without errors.
4. Smoke-test the deployment by registering and logging in as a business owner and a student.

## Troubleshooting

- **Users redirected to the wrong login page** — verify `JWT_SECRET` matches across environments and that `auth-token` cookies are being set. In production, cookies require `secure: true` and a matching domain.
- **`Dynamic server usage` build errors** — API routes that read cookies or headers must export `const dynamic = 'force-dynamic'`. This is already set on existing routes; apply the same to any new route that reads request state.
- **`SUPABASE_SERVICE_ROLE_KEY` errors at runtime** — the variable must be defined in every environment where API routes run (Production and Preview at minimum).

## Pre-Deploy Checklist

- [ ] All required environment variables set in Vercel for the target environment
- [ ] `npm run type-check` passes locally
- [ ] `npm run build` succeeds locally
- [ ] No secrets committed (see `.env.example` for the canonical variable list)
- [ ] Business and student login flows verified on the Preview URL
