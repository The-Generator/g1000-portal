# Auth System Touchpoint Inventory

> Generated 2026-04-26. Full blast-radius map for the custom JWT → Supabase Auth migration.

---

## 1. Core Auth Library Files (DELETE or REWRITE)

These files **define** the current custom auth system and will need to be completely replaced or deleted.

| File | Purpose | Disposition |
|------|---------|-------------|
| `src/lib/auth.ts` | Signs JWTs (jose `SignJWT`), hashes/verifies passwords (bcryptjs), sets/clears `auth-token` cookie, re-exports from auth-edge | **Delete or rewrite entirely** |
| `src/lib/auth-edge.ts` | Edge-compatible JWT verification (jose `jwtVerify`), `getUserFromRequest()`, `getTokenFromRequest()`, fetches user from DB via `supabaseAdmin` | **Delete or rewrite entirely** |
| `src/lib/supabase.ts` | Creates `supabase` (anon) and `supabaseAdmin` (service-role) clients. Also has DB type definitions | **Modify** — keep clients, but will need to add Supabase Auth helpers (e.g., `createServerClient`, `createBrowserClient`) |

### Exported Functions & Their Consumers

| Function | Defined In | Import Count | Action |
|----------|-----------|--------------|--------|
| `getUserFromRequest()` | `auth-edge.ts` (re-exported from `auth.ts`) | **39 files** | Replace with Supabase session check |
| `signToken()` | `auth.ts` | **5 files** (all auth routes) | Delete — Supabase Auth handles token minting |
| `verifyToken()` | `auth-edge.ts` (re-exported from `auth.ts`) | Internal only | Delete |
| `getTokenFromRequest()` | `auth-edge.ts` (re-exported from `auth.ts`) | Internal only | Delete |
| `hashPassword()` | `auth.ts` | Not imported externally (registration routes use `supabaseAdmin.auth.admin.createUser` instead) | Delete |
| `verifyPassword()` | `auth.ts` | Not imported externally | Delete |
| `createAuthResponse()` | `auth.ts` | Not imported externally | Delete |
| `clearAuthCookies()` | `auth.ts` | Not imported externally | Delete |
| `requireAuth()` | `auth.ts` | Not imported externally | Delete |

---

## 2. Auth API Routes (DELETE or REWRITE)

All under `src/app/api/auth/`:

| Route File | Methods | What It Does | Disposition |
|-----------|---------|-------------|-------------|
| `src/app/api/auth/student/login/route.ts` | POST | Calls `supabaseAdmin.auth.signInWithPassword`, fetches user row, calls `signToken()`, sets `auth-token` cookie | **Rewrite** — use Supabase Auth session flow |
| `src/app/api/auth/business/login/route.ts` | POST | Same pattern — `signInWithPassword` + custom JWT + cookie | **Rewrite** |
| `src/app/api/auth/admin/login/route.ts` | POST | Same pattern | **Rewrite** |
| `src/app/api/auth/register/student/route.ts` | POST | `supabaseAdmin.auth.admin.createUser()`, inserts into `users`+`student_profiles`, calls `signToken()`, sets cookie | **Rewrite** |
| `src/app/api/auth/register/business/route.ts` | POST | Same pattern for business registration | **Rewrite** |
| `src/app/api/auth/logout/route.ts` | POST | Deletes `auth-token` cookie | **Rewrite** — use Supabase `signOut()` |
| `src/app/api/auth/me/route.ts` | GET | Calls `getUserFromRequest()`, returns user + business profile | **Rewrite** — use Supabase session |

### Missing Route (Referenced But Not Found)
- **`/api/auth/change-password`** — called by `src/app/student/profile/page.tsx` (line 310) and `src/app/business/profile/page.tsx` (line 295) but **no route file exists**. This is a dead reference or planned feature.

---

## 3. Middleware (`src/middleware.ts`) — REWRITE

**Current behavior:**
1. Imports `getUserFromRequest` from `@/lib/auth-edge`
2. Checks if path is under `/student`, `/business`, `/admin`, `/api/student`, `/api/students`, `/api/business`, `/api/admin`
3. Exempts public pages: `/business/register`, `/business/login`, `/admin/login`
4. Calls `getUserFromRequest(request)` — reads `auth-token` cookie → verifies JWT → fetches user from DB
5. Redirects unauthenticated users to role-appropriate login pages
6. Enforces role-based access (student/owner/admin) for both page routes and API routes

**Migration impact:** The entire middleware auth check mechanism must be replaced with Supabase session verification. The route protection logic (which routes need which roles) should be preserved.

---

## 4. API Routes Using `getUserFromRequest()` — MODIFY

These routes import `getUserFromRequest` to identify the current user. Each will need the import swapped to use Supabase session-based auth.

### Importing from `@/lib/auth` (Node.js runtime)

| File |
|------|
| `src/app/api/admin/businesses/route.ts` |
| `src/app/api/auth/me/route.ts` |
| `src/app/api/business/active-projects/route.ts` |
| `src/app/api/business/active-projects/[id]/route.ts` |
| `src/app/api/business/active-projects/[id]/comments/route.ts` |
| `src/app/api/business/active-projects/[id]/overview/route.ts` |
| `src/app/api/business/active-projects/[id]/review/route.ts` |
| `src/app/api/business/profile/logo/route.ts` |
| `src/app/api/business/projects/[id]/applications/[appId]/accept/route.ts` |
| `src/app/api/business/projects/[id]/applications/[appId]/invite/route.ts` |
| `src/app/api/business/projects/[id]/applications/[appId]/meeting-link/route.ts` |
| `src/app/api/business/projects/[id]/applications/[appId]/reject/route.ts` |
| `src/app/api/business/projects/[id]/applications/[appId]/reschedule/route.ts` |
| `src/app/api/business/projects/[id]/applications/[appId]/undo-reject/route.ts` |
| `src/app/api/business/projects/[id]/comments/[commentId]/route.ts` |
| `src/app/api/business/projects/[id]/overview/route.ts` |
| `src/app/api/business/projects/[id]/review/route.ts` |
| `src/app/api/business/projects/[id]/updates/[updateId]/route.ts` |
| `src/app/api/business/projects/[id]/updates/[updateId]/comment/route.ts` |
| `src/app/api/opportunities/route.ts` |
| `src/app/api/opportunities/[id]/route.ts` |
| `src/app/api/student/applications/route.ts` |
| `src/app/api/student/applications/[id]/route.ts` |
| `src/app/api/student/applications/[id]/withdraw/route.ts` |
| `src/app/api/student/me/route.ts` |
| `src/app/api/student/opportunities/[id]/apply/route.ts` |
| `src/app/api/student/profile/route.ts` |
| `src/app/api/student/projects/route.ts` |
| `src/app/api/student/projects/[id]/route.ts` |
| `src/app/api/student/projects/[id]/comments/route.ts` |
| `src/app/api/student/projects/[id]/comments/[commentId]/route.ts` |
| `src/app/api/student/projects/[id]/reflection/route.ts` |
| `src/app/api/student/projects/[id]/updates/route.ts` |
| `src/app/api/student/projects/[id]/updates/[updateId]/route.ts` |
| `src/app/api/student/stats/route.ts` |
| `src/app/api/student/upload-photo/route.ts` |

### Importing from `@/lib/auth-edge` (Edge runtime)

| File |
|------|
| `src/middleware.ts` |
| `src/app/api/business/profile/route.ts` |
| `src/app/api/business/projects/route.ts` |
| `src/app/api/business/projects/[id]/route.ts` |
| `src/app/api/business/projects/[id]/applications/route.ts` |
| `src/app/api/students/[id]/profile/route.ts` |

> **Note:** The split between `auth.ts` and `auth-edge.ts` exists because `bcryptjs` is not edge-compatible. With Supabase Auth, this split should become unnecessary.

---

## 5. Client Components Calling Auth Endpoints — MODIFY

| Client File | Auth Interactions | Lines |
|------------|-------------------|-------|
| `src/app/login/page.tsx` | `fetch('/api/auth/student/login')`, `fetch('/api/auth/register/student')`, redirect to `/login` on registration | 62, 104, 115 |
| `src/app/admin/login/page.tsx` | `fetch('/api/auth/admin/login')` | 27 |
| `src/app/business/login/page.tsx` | `fetch('/api/auth/business/login')` | 51 |
| `src/app/business/register/page.tsx` | `fetch('/api/auth/register/business')` | 40 |
| `src/app/student/layout.tsx` | `fetch('/api/auth/me')` to load user, `fetch('/api/auth/logout')` on logout, `router.push('/login')` on auth failure | 37, 76, 39, 45, 65 |
| `src/app/business/layout.tsx` | `fetch('/api/auth/me')` to load user, `fetch('/api/auth/logout')` on logout, `router.push('/business/login')` on auth failure | 127, 158, 133, 148, 152, 160 |
| `src/app/admin/layout.tsx` | `fetch('/api/auth/me')` to load user, `fetch('/api/auth/logout')` on logout, `router.push('/admin/login')` on auth failure | 55, 79, 61, 68, 81 |
| `src/app/student/profile/page.tsx` | `fetch('/api/auth/change-password')` — **dead endpoint** | 310 |
| `src/app/business/profile/page.tsx` | `fetch('/api/auth/change-password')` — **dead endpoint** | 295 |
| `src/app/business/dashboard/page.tsx` | `router.push('/business/login')` on 401 response | 144 |
| `src/app/business/projects/page.tsx` | `router.push('/business/login')` on unauthorized | 52 |
| `src/app/business/projects/[id]/page.tsx` | `router.push('/business/login')` on unauthorized | 98 |

---

## 6. Cookie: `auth-token` References

| File | Line(s) | Usage |
|------|---------|-------|
| `src/lib/auth-edge.ts` | 42 | `request.cookies.get('auth-token')` — reads token |
| `src/lib/auth.ts` | 47, 59 | `response.cookies.set('auth-token', ...)` / `response.cookies.delete('auth-token')` |
| `src/app/api/auth/logout/route.ts` | 8 | `response.cookies.delete('auth-token')` |
| `src/app/api/auth/business/login/route.ts` | 88 | `response.cookies.set('auth-token', ...)` |
| `src/app/api/auth/admin/login/route.ts` | 69 | `response.cookies.set('auth-token', ...)` |
| `src/app/api/auth/student/login/route.ts` | 73 | `response.cookies.set('auth-token', ...)` |
| `src/app/api/auth/register/student/route.ts` | 161 | `response.cookies.set('auth-token', ...)` |
| `src/app/api/auth/register/business/route.ts` | 158 | `response.cookies.set('auth-token', ...)` |

---

## 7. Third-Party Library Dependencies

| Package | Version | Used In | Post-Migration |
|---------|---------|---------|----------------|
| `jose` | ^5.1.3 | `auth.ts` (SignJWT), `auth-edge.ts` (SignJWT, jwtVerify) | **Remove** — Supabase manages JWTs |
| `bcryptjs` | ^2.4.3 | `auth.ts` (hash, compare) | **Remove** — Supabase Auth handles password hashing |
| `@supabase/supabase-js` | (already installed) | `supabase.ts` and all API routes | **Keep** — add `@supabase/ssr` for cookie-based session handling |

### Environment Variables

| Variable | Used In | Post-Migration |
|----------|---------|----------------|
| `JWT_SECRET` | `auth.ts`, `auth-edge.ts` | **Remove** — Supabase manages JWT signing |
| `NEXT_PUBLIC_SUPABASE_URL` | `supabase.ts` | **Keep** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `supabase.ts` | **Keep** |
| `SUPABASE_SERVICE_ROLE_KEY` | `supabase.ts` | **Keep** |

---

## 8. Supabase Auth Admin Usage in Auth Routes

The registration and login routes already use `supabaseAdmin.auth` methods alongside the custom JWT:

| File | Supabase Auth Call |
|------|-------------------|
| `src/app/api/auth/register/student/route.ts` | `supabaseAdmin.auth.admin.createUser()`, `supabaseAdmin.auth.admin.deleteUser()` (rollback) |
| `src/app/api/auth/register/business/route.ts` | `supabaseAdmin.auth.admin.createUser()`, `supabaseAdmin.auth.admin.deleteUser()` (rollback) |
| `src/app/api/auth/student/login/route.ts` | `supabaseAdmin.auth.signInWithPassword()` |
| `src/app/api/auth/business/login/route.ts` | `supabaseAdmin.auth.signInWithPassword()` |
| `src/app/api/auth/admin/login/route.ts` | `supabaseAdmin.auth.signInWithPassword()` |
| `src/app/api/admin/businesses/route.ts` | `supabaseAdmin.auth.admin.deleteUser()` |

> **Key insight:** The codebase already authenticates against Supabase Auth, then mints a **separate** custom JWT. The migration's main job is to stop minting/verifying custom JWTs and instead use the Supabase-issued session token directly.

---

## 9. Summary: Files by Disposition

### Can Be Deleted Outright (2 files)
- `src/lib/auth.ts` — only if all exports are re-homed or removed
- `src/lib/auth-edge.ts` — same

### Must Be Rewritten (7 files — auth API routes)
- `src/app/api/auth/student/login/route.ts`
- `src/app/api/auth/business/login/route.ts`
- `src/app/api/auth/admin/login/route.ts`
- `src/app/api/auth/register/student/route.ts`
- `src/app/api/auth/register/business/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/me/route.ts`

### Must Be Rewritten (1 file — middleware)
- `src/middleware.ts`

### Must Be Modified (36 API route files)
All files listed in Section 4 — each imports `getUserFromRequest` and needs the import + call swapped.

### Must Be Modified (12 client component files)
All files listed in Section 5 — need auth API calls and redirect logic updated.

### Must Be Modified (1 shared lib file)
- `src/lib/supabase.ts` — add Supabase SSR helpers for cookie-based auth

### Packages to Add
- `@supabase/ssr` — for `createServerClient` / `createBrowserClient` with cookie handling

### Packages to Remove
- `jose` — custom JWT signing/verification
- `bcryptjs` — password hashing (handled by Supabase Auth)

### Env Vars to Remove
- `JWT_SECRET`

---

## 10. Total Blast Radius

| Category | Count |
|----------|-------|
| Core auth files to delete/rewrite | 2 |
| Auth API routes to rewrite | 7 |
| Middleware to rewrite | 1 |
| API routes to modify (import swap) | 36 |
| Client components to modify | 12 |
| Shared lib to modify | 1 |
| **Total files touched** | **59** |
