# Architecture: G1000 Portal

## Overview
G1000 Portal is a Next.js 14 App Router application connecting Babson College students with business owners for project-based opportunities. Three portals: Student, Business, Admin.

## Auth Architecture (Post-Migration Target)

### Session Management
- **Package:** `@supabase/ssr` with `@supabase/supabase-js`
- **Pattern:** Cookie-based sessions managed by Supabase. No custom JWTs.
- **Client utilities:**
  - `src/lib/supabase/client.ts` — `createBrowserClient()` for client components
  - `src/lib/supabase/server.ts` — `createServerClient()` for server components and route handlers (uses `cookies()` from `next/headers`, synchronous in Next.js 14)
  - `src/lib/supabase/middleware.ts` — middleware helper using `request.cookies`/`response.cookies`
- **Cookie format:** Supabase manages `sb-<ref>-auth-token` cookies automatically via `getAll()`/`setAll()` — NEVER use individual `get`/`set`/`remove`

### Auth Flow
1. User visits `/login` — single unified page with Google OAuth + email/password
2. Google OAuth: `signInWithOAuth()` → Google → Supabase callback → `/auth/callback` route → `exchangeCodeForSession()`
3. Email/password: `signInWithPassword()` or `signUp()` directly
4. Middleware runs `getUser()` on every request → refreshes session → checks role
5. If no `users` table row → redirect to `/onboarding` for role selection
6. If role exists → route to role-specific dashboard

### Middleware Logic
- Runs on all routes except static assets
- Refreshes Supabase session (critical: no code between `createServerClient` and `getUser()`)
- Public paths: `/`, `/login`, `/auth/callback`, `/onboarding`
- Protected paths: `/student/*`, `/business/*`, `/admin/*` and their API equivalents
- Role enforcement: student↔business cross-access blocked; admin-only for `/admin/*`
- API routes return 401 JSON (not redirect) for unauthenticated requests

### Onboarding
- `/onboarding` page: role selection (Student or Business Owner)
- Student: enforces @babson.edu email, creates `users` (role=student) + `student_profiles`
- Business Owner: creates `users` (role=owner) + `business_owner_profiles` (is_approved=true)
- After role selection, collect business details (company name etc.) for business owners
- Existing users with roles skip onboarding entirely

### Session Helper Pattern for API Routes
All 36+ API routes use a server-side Supabase client to get the authenticated user:
```
const supabase = createClient()  // from src/lib/supabase/server.ts
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
// Then look up users table row for role/profile data
```

## Database Schema (Key Tables)
- `users` — id (matches Supabase Auth UID), email, name, role, created_at, updated_at
- `student_profiles` — user_id FK, major, year, skills[], availability, etc.
- `business_owner_profiles` — user_id FK, company_name, industry, is_approved, etc.
- `projects` — business owner's posted opportunities
- `applications` — student applications to projects

## Tech Stack
- Next.js 14.0.x (App Router, no Pages Router)
- Supabase (hosted): Auth + Postgres database
- Tailwind CSS for styling
- TypeScript (strict mode)

## Key Invariants
- `users.id` always matches `auth.users.id` (Supabase Auth UID)
- Every authenticated user has a `users` row (created during onboarding)
- `supabaseAdmin` (service role) used only in admin operations and onboarding user creation
- Passwords stored only in Supabase Auth — never in application tables
