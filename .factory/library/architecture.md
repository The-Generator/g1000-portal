# G1000 Portal — Architecture

## System Overview

Next.js 14 App Router monolith deployed on Vercel. Supabase provides the hosted PostgreSQL database and authentication service. The application connects Babson College students with business owners for AI/automation consulting projects.

## Component Architecture

```
src/
├── app/
│   ├── student/*      # Student portal (dashboard, projects, applications)
│   ├── business/*     # Business owner portal (projects, student matching)
│   ├── admin/*        # Admin portal (user management, approvals, resources)
│   └── api/           # API routes organized by domain
│       ├── auth/      # Login, register, logout, session
│       ├── students/  # Student-specific endpoints
│       ├── business/  # Business owner endpoints
│       ├── projects/  # Project CRUD & lifecycle
│       ├── admin/     # Admin operations
│       └── ...
├── components/        # Shared React components
└── lib/               # Core libraries
    ├── supabase.ts    # Supabase client (admin/service-role)
    ├── auth.ts        # JWT utilities, token helpers
    ├── email.ts       # Email sending
    └── helpers.ts     # Shared utilities
```

Three role-scoped portals share a common component library and API layer. All server-side DB access goes through a single Supabase service-role client.

## Auth Architecture

| Layer | Technology |
|-------|-----------|
| Password storage & verification | Supabase Auth |
| Session tokens | Custom JWTs (jose library) |
| Token storage | HTTP-only cookies |
| Route protection | Next.js middleware (role-based) |

**Roles:** `student`, `owner`, `admin`

**Auth flow:**
1. User registers → Supabase Auth creates auth record
2. App creates row in `users` table + role-specific profile
3. Custom JWT issued (contains `userId`, `email`, `role`)
4. Middleware intercepts every request, verifies JWT, enforces role access

## Data Flow

```
Browser → Next.js API Route → supabaseAdmin (service role) → PostgreSQL
```

- All DB operations use the service-role client (`supabaseAdmin`), never the anon client.
- API routes parse the JWT from cookies to identify the caller.
- Middleware rejects unauthenticated or unauthorized requests before they reach API handlers.

## Database (14 Core Tables)

**Identity**
- `users` — base user record (id, email, role, created_at)
- `student_profiles` — Babson student details
- `business_owner_profiles` — business owner details + `is_approved` flag
- `admins` — admin reference table

**Project Matching**
- `projects` — business-posted project listings
- `applications` — student applications to projects

**Project Lifecycle**
- `project_comments` — threaded discussion on projects
- `project_overviews` — high-level project summaries
- `project_reflections` — student post-project reflections
- `project_reviews` — reviews/ratings
- `project_updates` — status updates during active projects

**Learning Resources**
- `resources` — shared learning materials
- `support_documents` — uploaded support files
- `resource_categories` — taxonomy for resources

## Key Invariants

1. **Service-role only** — All API routes use `supabaseAdmin` for DB operations.
2. **JWT payload** — Tokens always contain `userId`, `email`, `role`.
3. **Business approval** — Owners must have `is_approved = true` (auto-set on registration).
4. **Babson email** — Students must register with an `@babson.edu` address.
5. **Passwords in Auth only** — Passwords are stored exclusively in Supabase Auth, never in the `users` table.
