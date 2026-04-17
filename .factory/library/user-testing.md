# User Testing

## Validation Surface

**Primary surface:** Browser UI at `http://localhost:3000`
**Tool:** `agent-browser` for all UI validation
**API testing:** `curl` for direct endpoint verification

### Browser Flows to Test
- Business registration: /business/register (fill form, submit)
- Business login: /business/login (email + password)
- Business dashboard: /business/dashboard (verify loads post-login)
- Business opportunity posting: /business/projects/new (fill form, submit)
- Student registration: /login (register tab, fill form)
- Student login: /login (email + password)
- Student dashboard: /student/dashboard
- Student browse opportunities: /student/opportunities
- Landing page: / (verify portal links work)
- Navigation across portals

### API Endpoints to Test
- POST /api/auth/register/business (registration)
- POST /api/auth/business/login (business login)
- POST /api/auth/register/student (student registration)
- POST /api/auth/student/login (student login)
- Dead endpoints should 404

### Pre-Test Setup
1. Start dev server: `npm run dev` (port 3000)
2. Wait for healthcheck: `curl -sf http://localhost:3000`
3. Supabase must be accessible (remote hosted, always available)

### Auth Bootstrap
For agent-browser tests requiring authenticated state:
1. Use curl to register a test user via the API
2. Extract auth-token from Set-Cookie header
3. Set cookie in browser session before navigating to protected pages

## Validation Concurrency

**Surface: agent-browser**
- Machine: 24GB RAM, 14 CPU cores
- Dev server: ~726MB RSS
- Each agent-browser instance: ~300MB
- Available headroom (70%): ~16GB * 0.7 = ~11.2GB usable
- After dev server: ~10.5GB available
- Max concurrent validators: **4** (4 * 300MB = 1.2GB, well within budget)
- Rationale: Conservative limit due to system memory pressure observed (3.3M pages in compressor)

**Surface: curl-shell**
- Resource cost: very low (single process + HTTP requests)
- Max concurrent validators: **2**
- Rationale: avoid log interleaving and shared-state collisions while still parallelizing read-only endpoint checks.

## Flow Validator Guidance: curl-shell

- Base URL: `http://localhost:3000`
- Stay within HTTP/API and shell validation scope only; do not mutate application business data beyond temporary validation requests.
- Use deterministic commands from `validation-contract.md` and capture exact status codes/output.
- Keep request payloads isolated by using unique test emails when registration endpoints are involved.
- Save command outputs as evidence under mission evidence paths and summarize pass/fail per assertion in flow JSON.

## Flow Validator Guidance: agent-browser

- Base URL: `http://localhost:3000`
- Use a dedicated browser session per validator and do not reuse another validator's session/cookies.
- Use unique test accounts per validator to avoid cross-test collisions in auth and dashboard state.
- Keep tests scoped to assigned assertions only; avoid editing unrelated data or global settings.
- Capture screenshots for each UI assertion and save them under the assigned evidence directory.
- If an auth assertion depends on prior registration, complete registration in the same validator context before login/dashboard checks.
- After navigation/form submissions, re-check URL/page text once before asserting final state because immediate reads can briefly show the previous route.
