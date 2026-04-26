---
name: fullstack-worker
description: Full-stack worker for Next.js + Supabase auth migration covering API routes, UI pages, middleware, and cleanup tasks.
---

# Full-Stack Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

For features involving:
- Supabase SSR client setup and configuration
- Auth API route creation/rewriting
- Middleware auth logic
- UI page creation (login, onboarding)
- Client component auth pattern updates
- Auth-related code cleanup and deletion
- Cross-cutting import swaps across many files

## Required Skills

- **agent-browser**: MUST invoke for any feature that creates or modifies user-facing pages. Use to verify login flows, onboarding, redirects, and dashboard access.

## Work Procedure

### Step 1: Understand the Feature
1. Read the feature description, preconditions, expectedBehavior, and verificationSteps carefully
2. Read `AGENTS.md` for mission boundaries and coding conventions
3. Read `.factory/library/architecture.md` for the target auth architecture
4. Read `.factory/research/supabase-ssr-nextjs.md` for @supabase/ssr patterns (CRITICAL — contains Next.js 14-specific patterns)
5. Read `.factory/research/auth-touchpoints.md` for the full blast radius inventory

### Step 2: Plan and Investigate
1. Identify all files that need to change for this feature
2. Read each file to understand its current state
3. Plan the order of changes (infrastructure first, then consumers)
4. If anything is unclear or contradicts AGENTS.md, return to orchestrator

### Step 3: Implement with TDD
1. For API routes: write a curl-based verification plan before implementation
2. For UI pages: plan agent-browser verification steps before implementation
3. Implement changes file by file
4. After each logical unit of change, run `npm run type-check` to catch errors early
5. Follow @supabase/ssr patterns EXACTLY from the research doc — especially:
   - `cookies()` is SYNCHRONOUS in Next.js 14
   - Use `getAll()`/`setAll()` for cookies (never individual get/set/remove)
   - Use `getUser()` for auth checks (never `getSession()`)
   - No code between `createServerClient` and `getUser()` in middleware

### Step 4: Verify Thoroughly
1. Run `npm run type-check` — must be zero errors
2. Run `npm run build` — must succeed
3. Run `npm run lint` — note any NEW errors (pre-existing warnings are OK)
4. For UI features: invoke `agent-browser` skill to test every user flow
   - Navigate to the page
   - Interact with forms, buttons, links
   - Verify redirects and error states
   - Take screenshots as evidence
5. For API features: use `curl` to test endpoints with and without auth
6. Check adjacent features: if you changed middleware, verify that other portals still work

### Step 5: Cleanup
1. Remove any temporary test code
2. Ensure no `console.log` debugging statements remain
3. Verify no old imports (`@/lib/auth`, `@/lib/auth-edge`) snuck back in

## Example Handoff

```json
{
  "salientSummary": "Created Supabase SSR client utilities (browser, server, middleware), rewrote middleware.ts to use Supabase session with role-based routing and onboarding redirect. Verified via type-check (0 errors), build (success), and agent-browser (protected routes redirect to /login, public routes accessible).",
  "whatWasImplemented": "Three Supabase SSR utility files (src/lib/supabase/client.ts, server.ts, middleware.ts), rewrote src/middleware.ts to use updateSession() with Supabase auth.getUser(), added role-based redirect logic (student→/student/dashboard, owner→/business/dashboard, admin→/admin), added /onboarding redirect for users without roles, updated public path exemptions to /login, /auth/callback, /onboarding.",
  "whatWasLeftUndone": "",
  "verification": {
    "commandsRun": [
      { "command": "npm run type-check", "exitCode": 0, "observation": "Zero errors" },
      { "command": "npm run build", "exitCode": 0, "observation": "Compiled successfully in 8.2s" },
      { "command": "npm run lint", "exitCode": 0, "observation": "No new errors, 211 pre-existing warnings" },
      { "command": "curl -v http://localhost:3000/student/dashboard", "exitCode": 0, "observation": "HTTP 307 redirect to /login" },
      { "command": "curl -v http://localhost:3000/login", "exitCode": 0, "observation": "HTTP 200" },
      { "command": "curl -v http://localhost:3000/", "exitCode": 0, "observation": "HTTP 200" }
    ],
    "interactiveChecks": [
      { "action": "Navigated to /student/dashboard without session via agent-browser", "observed": "Redirected to /login page. Login form visible with Google OAuth button." },
      { "action": "Navigated to /business/dashboard without session", "observed": "Redirected to /login. Confirmed not /business/login." },
      { "action": "Navigated to / without session", "observed": "Landing page loads normally, no redirect." },
      { "action": "Navigated to /auth/callback without code param", "observed": "Redirected to /login with error handling." }
    ]
  },
  "tests": {
    "added": []
  },
  "discoveredIssues": [
    { "severity": "low", "description": "The landing page still has a link to /business/login in the CTA section. This needs to be updated to /login in a future feature.", "suggestedFix": "Update src/app/page.tsx CTA links from /business/login to /login" }
  ]
}
```

## When to Return to Orchestrator

- Supabase Auth operations fail with permission errors (service role key may be invalid)
- A dependency is missing that isn't in package.json
- The middleware changes break the dev server startup
- An API route requires a database schema change (out of scope)
- Feature requires Google OAuth to be enabled but it isn't configured yet
- More than 5 files need changes not listed in the feature description
