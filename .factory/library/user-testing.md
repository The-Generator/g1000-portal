# User Testing

## Validation Surface

**Primary surface:** Browser (Next.js web application at localhost:3000)
**Testing tool:** `agent-browser` for all UI flows
**Secondary tool:** `curl` for API endpoint verification

### Key Flows to Test
1. **Unified Login:** /login page with Google OAuth + email/password
2. **Onboarding:** /onboarding for new users (role selection)
3. **Route Protection:** Middleware redirects, role enforcement, API 401s
4. **Portal Flows:** Student and Business dashboards with new auth
5. **Session Management:** Persistence, refresh, logout

### Google OAuth Limitation
Google OAuth can only be tested up to redirect initiation (clicking the button confirms it calls signInWithOAuth). Full Google sign-in requires real Google credentials which are not automatable. Post-callback behavior (onboarding, role routing) is tested via email/password flows that exercise the same code paths.

### Test Account Strategy
- Create test users via Supabase Auth admin API during test setup
- Use unique emails per test run to avoid collisions
- Clean up test users after validation

## Validation Concurrency

**Machine:** 24 GB RAM, 14 CPU cores
**Dev server footprint:** ~821 MB RSS
**agent-browser footprint:** ~300 MB per instance

Available headroom: ~16 GB * 0.7 = 11.2 GB usable
Dev server: 821 MB + 5 agents * 300 MB = 2.3 GB → well within budget

**Max concurrent validators: 5**
