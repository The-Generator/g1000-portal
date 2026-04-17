# Environment

**What belongs here:** Required env vars, external dependencies, setup notes.
**What does NOT belong here:** Service ports/commands (use `.factory/services.yaml`).

---

## Required Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only, bypasses RLS) |
| `JWT_SECRET` | Secret for signing JWT auth tokens |
| `NEXT_PUBLIC_APP_URL` | Base URL of the application |
| `SENDGRID_API_KEY` | SendGrid API key for email sending (optional for dev) |

## External Dependencies

- **Supabase**: Hosted PostgreSQL + Auth at `genufllbsvczadzhukor.supabase.co`
- **SendGrid**: Email delivery (not required for local dev)
- **Vercel**: Production hosting (deployment only)

## Supabase MCP

Connected via: `droid mcp add supabase https://mcp.supabase.com/mcp?project_ref=genufllbsvczadzhukor --type http`
Use for direct DB schema inspection and DDL operations.
