# Environment

Environment variables, external dependencies, and setup notes.

**What belongs here:** Required env vars, external API keys/services, dependency quirks, platform-specific notes.
**What does NOT belong here:** Service ports/commands (use `.factory/services.yaml`).

---

## Required Environment Variables

| Variable | Description | Source |
|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_APP_URL` | App base URL (http://localhost:3000 for dev) | Set manually |
| `SENDGRID_API_KEY` | SendGrid API key for emails | SendGrid dashboard |

## Removed Variables (Post-Migration)
| Variable | Reason |
|----------|--------|
| `JWT_SECRET` | Custom JWT signing no longer used — Supabase manages tokens |

## External Dependencies
- **Supabase (hosted):** Auth, Postgres database, Storage
- **SendGrid:** Transactional email delivery
- **Google OAuth:** Requires Google Cloud Console OAuth 2.0 Client ID configured in Supabase dashboard
