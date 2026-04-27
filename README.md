# G1000 Portal

A student-business matching platform for the Babson G1000 / AI Innovators Bootcamp. Students browse and apply to real-world AI and automation projects posted by local business owners. Admins manage approvals, resources, and platform analytics.

## Tech Stack

| Layer       | Technology                                         |
|-------------|----------------------------------------------------|
| Framework   | Next.js 14 (App Router)                            |
| Language    | TypeScript (strict)                                |
| UI          | React 18, Tailwind CSS, Radix UI, Headless UI      |
| Database    | PostgreSQL via Supabase                            |
| Auth        | Supabase Auth (@supabase/ssr) — Google OAuth + email/password |
| Email       | SendGrid (`@sendgrid/mail`)                        |
| Charts      | Recharts                                           |
| Hosting     | Vercel                                             |

## Authentication

All roles authenticate through a **single `/login` page** via **Google OAuth** or **email + password**. Sessions are managed natively by Supabase Auth using `@supabase/ssr` (server-side cookie sessions — no custom JWTs).

**Auth flow:**
1. User signs in at `/login` (Google OAuth or email/password).
2. OAuth callbacks are handled by `/auth/callback`.
3. First-time users are redirected to `/onboarding` to select their role (student, business owner).
4. Returning users are routed directly to their role-based dashboard.

| Role           | Login page | Notes                                                     |
|----------------|------------|------------------------------------------------------------|
| Student        | `/login`   | Only `@babson.edu` emails accepted                        |
| Business Owner | `/login`   | Auto-approved (`is_approved = true`) on registration      |
| Admin          | `/login`   | Seeded manually; elevated role checked by middleware       |

Route protection is enforced by `src/middleware.ts`, which verifies the Supabase session on every protected path and redirects unauthenticated users to `/login`.

## Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── api/
│   │   ├── auth/            # Auth-related API routes
│   │   ├── admin/           # Admin endpoints
│   │   ├── business/        # Business endpoints
│   │   ├── student/         # Student endpoints
│   │   ├── opportunities/   # Public project listings
│   │   └── resources/       # Learning resources
│   ├── auth/callback/       # OAuth callback handler
│   ├── admin/               # Admin portal pages
│   ├── business/            # Business portal pages
│   ├── student/             # Student portal pages
│   ├── login/               # Unified login page (Google OAuth + email/password)
│   ├── onboarding/          # First-time role selection
│   └── page.tsx             # Landing page (routes users to portals)
├── components/              # Shared React components
│   └── ui/                  # Base UI primitives (Button, Card, Input, …)
├── lib/
│   ├── supabase.ts          # Supabase clients (browser, server, admin)
│   ├── email.ts             # SendGrid transport
│   ├── emailTemplates.ts    # Transactional HTML templates
│   └── utils.ts             # Helpers (date formatting, DB ↔ UI transforms)
├── types/index.ts           # Shared TypeScript interfaces & enums
└── middleware.ts            # Route protection and role-based redirects
```

## Database

PostgreSQL hosted on Supabase. Core tables:

- `users` — all accounts (id, email, name, role); mirrors Supabase Auth user IDs
- `student_profiles` — major, year, skills, availability, links, bio
- `business_owner_profiles` — company info, contact, `is_approved`
- `projects` — opportunity listings (type, compensation, skills, deadlines, status)
- `applications` — student → project applications with status workflow
- `resources` / `support_documents` — learning materials surfaced to students

Passwords live in Supabase Auth only; the `users` table does not store password hashes.

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (URL, anon key, service role key)
- A SendGrid API key (for transactional email, optional in local dev)

### Setup

```bash
npm install
cp .env.example .env.local
# then fill in .env.local with your credentials
```

See `.env.example` for the full list of required variables.

### Development Commands

```bash
npm run dev         # Start Next.js dev server on http://localhost:3000
npm run build       # Production build
npm run start       # Run the production build
npm run lint        # ESLint
npm run type-check  # TypeScript (tsc --noEmit)
```

## Architecture Overview

- **API routes** (`src/app/api/**`) run on the Node runtime, use the Supabase service-role client (`supabaseAdmin`) for privileged operations, and declare `export const dynamic = 'force-dynamic'` when they read cookies or DB state.
- **Middleware** (`src/middleware.ts`) runs on the Edge runtime and uses `@supabase/ssr` to verify Supabase sessions.
- **Auth flow** — users sign in via Google OAuth or email/password at `/login`. OAuth callbacks land at `/auth/callback`. First-time users are redirected to `/onboarding` for role selection, which creates the `users` row and role-specific profile. Returning users are routed to their role-based dashboard. Sessions are managed entirely by Supabase Auth (server-side cookies via `@supabase/ssr`).
- **UI** uses Tailwind with the custom tokens in `tailwind.config.js` (`generator-dark`, `generator-green`, `generator-gold`, `primary-*`). Shared primitives live in `src/components/ui/`.

## Deployment

Deployed on Vercel. Pushes to `main` trigger automatic deployments. See `VERCEL_DEPLOYMENT.md` for required environment variables and deployment notes.
