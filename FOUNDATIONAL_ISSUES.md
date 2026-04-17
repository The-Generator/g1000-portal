# Foundational Issues Audit

A comprehensive list of security vulnerabilities, architecture problems, and technical debt found in the G1000 Portal codebase.

---

## CRITICAL -- Security

### 1. Secrets committed to git
**File:** `VERCEL_DEPLOYMENT.md`
- JWT_SECRET, Supabase anon key, and **Supabase service role key** are all hardcoded in plaintext in a committed file.
- The service role key grants full database access bypassing RLS. This must be rotated immediately.
- **Fix:** Delete the secrets from the file (and git history via `git filter-branch` or BFG), rotate all keys in Supabase dashboard, and use only environment variables.

### 2. Insecure JWT fallback secret
**Files:** `src/lib/auth.ts:6`, `src/lib/auth-edge.ts:7`
- Both files fall back to `'fallback-secret-key-for-development-only'` when `JWT_SECRET` env var is missing.
- If deployed without the env var, anyone can forge valid JWTs with the known fallback.
- **Fix:** Throw an error at startup if `JWT_SECRET` is not set instead of using a fallback.

### 3. Placeholder Supabase credentials
**File:** `src/lib/supabase.ts:3-5`
- Falls back to `'placeholder-key'` for both anon key and service role key.
- Same problem: silent failure instead of loud error. In dev this means silent broken state; in production it's a security gap if env vars are missing.
- **Fix:** Throw at module load if credentials are missing.

---

## HIGH -- Dev Bypasses Still in Code

### 4. Dev bypass for `rkatsura1@babson.edu`
**Documented in:** `TEMPORARY_CHANGES.md`
**Files affected:**
- `src/app/api/auth/request-code/route.ts` -- skips OTP email
- `src/app/api/auth/verify-code/route.ts` -- accepts code `000000`, uses hardcoded UUID `99999999-...`
- `src/app/api/auth/check-user/route.ts` -- forces OTP flow
- `src/lib/auth-edge.ts`, `src/lib/auth.ts` -- mock user for the hardcoded UUID

This is a full authentication bypass for a specific email. If deployed to production, anyone who knows the email + `000000` code gets admin-equivalent access.
- **Fix:** Remove all `isDevBypass` blocks. The `TEMPORARY_CHANGES.md` file documents exactly what to undo.

### 5. Test/debug pages shipped in production
**Directories:**
- `src/app/console-test/`
- `src/app/debug-login/`
- `src/app/test-login/`
- `src/app/test-supabase/`
- `src/app/test-availability/`
- `src/app/seed-business-owners/`
- `src/app/setup-database/`

These pages are accessible in production (no auth gating in middleware for most). The seed/setup pages can modify database state.
- **Fix:** Delete these pages or gate them behind admin auth. Also remove `test-api-debug.js`, `test-auth-flow.js`, `monitor-auth.js` from root.

### 6. Backup file committed
**File:** `src/app/business/projects/[id]/applicants/page.tsx.backup`
- A `.backup` file in the source tree. Not harmful but sloppy -- should be in `.gitignore` or deleted.

---

## HIGH -- Build & Type Safety Disabled

### 7. TypeScript and ESLint errors ignored during builds
**File:** `next.config.js`
```js
eslint: { ignoreDuringBuilds: true },
typescript: { ignoreBuildErrors: true }
```
- This means the production build will succeed even with type errors and lint violations. You have zero compile-time safety net.
- **Fix:** Remove both flags and fix all type/lint errors. Run `npm run type-check` and `npm run lint` to see current error count.

### 8. React strict mode disabled
**File:** `next.config.js`
```js
reactStrictMode: false
```
- Comment says "to prevent double renders that cause input focus loss" -- this masks a bug in input handling rather than fixing it.
- **Fix:** Fix the underlying controlled input bug, then re-enable strict mode.

---

## MEDIUM -- Architecture & Code Quality

### 9. Unused dependencies
**File:** `package.json`
- `@supabase/auth-helpers-nextjs` -- imported nowhere in src. The app uses custom JWT auth, not Supabase auth helpers.
- `next-auth` -- imported nowhere. The app rolled its own auth entirely.
- `node-fetch` -- not needed in Next.js (built-in fetch).
- **Fix:** `npm uninstall @supabase/auth-helpers-nextjs next-auth node-fetch`

### 10. Duplicate auth implementations
**Files:** `src/lib/auth.ts` and `src/lib/auth-edge.ts`
- Both files duplicate `verifyToken`, `getTokenFromRequest`, and `getUserFromRequest`. The edge version exists because bcrypt doesn't run in Edge Runtime, but this creates two parallel auth paths that can drift.
- **Fix:** Extract shared token verification into a single module. Only the bcrypt-dependent functions need a Node-only version.

### 11. Manual snake_case/camelCase transforms
**File:** `src/lib/utils.ts` (`transformProject`)
- Every DB entity needs manual field mapping between snake_case (DB) and camelCase (frontend). This is error-prone and unmaintained for new fields.
- **Fix:** Consider a systematic approach (e.g., a generic transformer, or use Supabase's generated types with a naming convention).

### 12. Type definitions vs DB schema drift
- `src/types/index.ts` defines `Project.compensationType` as `'paid-hourly' | 'paid-stipend' | ...`
- `src/lib/supabase.ts` DB types define it as `'stipend' | 'equity' | 'credit'`
- The spec defines yet another set. These three sources of truth are inconsistent.
- **Fix:** Generate types from the actual DB schema (e.g., `supabase gen types`) and use as single source of truth.

### 13. No `.env.example` file
- New developers have no template for required environment variables. The `.env.local` is gitignored (correctly), but there's no `.env.example` checked in.
- **Fix:** Create `.env.example` with placeholder variable names (no values).

---

## LOW -- Cleanup

### 14. Root-level test/debug scripts
Files in project root that should be removed or moved:
- `test-api-debug.js`
- `test-auth-flow.js`
- `monitor-auth.js`
- `g1000_business_owners.md`
- `g1000participants.md`
- `supabase-mcp-config.json`

### 15. Multiple redundant setup docs
- `SETUP_GUIDE.md`, `SUPABASE_AUTH_SETUP.md`, `VERCEL_DEPLOYMENT.md`, `TEMPORARY_CHANGES.md`, `ai_docs/README.md` all overlap in content.
- **Fix:** Consolidate into README and delete the rest.

### 16. No tests
- Zero test files in the entire codebase. No test framework configured.
- **Fix:** Add at minimum integration tests for auth flows and API routes.

### 17. `src/app/student-coming-soon/` page
- A placeholder "coming soon" page that appears to be from early development. Should be removed if the student portal is live.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical (security) | 3 |
| High (bypasses, build safety) | 5 |
| Medium (architecture) | 5 |
| Low (cleanup) | 4 |
