---
name: fullstack-worker
description: Full-stack worker for Next.js + Supabase features covering API routes, UI pages, DB operations, and cleanup tasks.
---

# Fullstack Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

Any feature touching the G1000 Portal codebase: API routes, React pages, Supabase DB operations, code cleanup, auth flows, UX improvements, documentation.

## Required Skills

- `agent-browser` -- for UI verification when the feature involves pages or forms. Invoke after implementation to verify the UI works correctly in a real browser.

## Work Procedure

### 1. Understand the Feature
- Read `mission.md`, `AGENTS.md`, and `.factory/library/architecture.md`
- Read the feature description carefully, including preconditions, expectedBehavior, and verificationSteps
- Read all files you'll modify BEFORE writing any code

### 2. Plan Changes
- List every file to CREATE, MODIFY, or DELETE
- If touching auth: read `AGENTS.md` auth architecture section carefully
- If touching DB: check `.factory/library/architecture.md` for table structure

### 3. Implement
- For API routes: implement the route handler, ensure `export const dynamic = 'force-dynamic'`
- For UI pages: implement the React component with Tailwind styling
- For cleanup: delete files/code, update imports, verify nothing breaks
- For DB operations: use Supabase service role client. For DDL (DROP TABLE, ALTER TABLE), use the Supabase MCP tools if available, or construct the SQL and execute via `supabaseAdmin.rpc()` or direct REST API
- Follow coding conventions in AGENTS.md strictly

### 4. Verify -- Automated
- Run `npm run type-check` -- MUST pass with 0 errors
- Run `npm run build` -- MUST succeed
- Run `npm run lint` -- fix any errors that affect correctness
- If you modified package.json: run `npm install`

### 5. Verify -- Interactive (UI features only)
- Start dev server if not running: `npm run dev`
- Use `agent-browser` skill to verify:
  - Pages load without errors
  - Forms submit correctly
  - Navigation works
  - Auth flows complete end-to-end
- Each browser verification = one `interactiveChecks` entry

### 6. Commit
- Stage only the files you changed
- Commit with descriptive message: `feat:`, `fix:`, `refactor:`, `chore:` prefix
- Push to main

## Example Handoff

```json
{
  "salientSummary": "Simplified business auth to email+password only. Removed 6 dead endpoints (request-code, verify-code, check-user, set-password, login/owner, login-password). Consolidated to POST /api/auth/register/business and POST /api/auth/business/login. Rewrote /business/login page to simple email+password form. Ran type-check (0 errors), build (success), and verified login flow via agent-browser.",
  "whatWasImplemented": "Rewrote business auth: register endpoint creates user in Supabase Auth + users table + business_owner_profiles with is_approved=true. Login endpoint uses signInWithPassword + JWT. Deleted 6 dead route files. Simplified login page from 3-step flow to single email+password form.",
  "whatWasLeftUndone": "",
  "verification": {
    "commandsRun": [
      { "command": "npm run type-check", "exitCode": 0, "observation": "0 errors" },
      { "command": "npm run build", "exitCode": 0, "observation": "Build succeeded, all pages compiled" },
      { "command": "curl -X POST http://localhost:3000/api/auth/register/business -H 'Content-Type: application/json' -d '{\"email\":\"test@company.com\",\"password\":\"test1234\",\"businessName\":\"Test Co\",\"contactName\":\"Test User\"}'", "exitCode": 0, "observation": "201 Created with user data" },
      { "command": "curl -X POST http://localhost:3000/api/auth/business/request-code -H 'Content-Type: application/json' -d '{\"email\":\"test@co.com\"}'", "exitCode": 0, "observation": "404 Not Found -- dead endpoint confirmed removed" }
    ],
    "interactiveChecks": [
      { "action": "Navigate to /business/login, enter email and password, submit", "observed": "Login succeeded, redirected to /business/dashboard with user greeting" },
      { "action": "Navigate to /business/register, fill all fields, submit", "observed": "Registration succeeded, redirected to /business/login with success message" }
    ]
  },
  "tests": {
    "added": []
  },
  "discoveredIssues": []
}
```

## When to Return to Orchestrator

- Supabase DB is unreachable or credentials are invalid
- A table referenced in the feature doesn't exist (schema mismatch)
- Type-check reveals errors in files outside this feature's scope that block the build
- Feature depends on another feature's endpoint that doesn't exist yet
- Ambiguous requirements that could go multiple ways
