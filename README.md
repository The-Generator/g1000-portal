# G1000 Portal

A student-business matching platform for the Babson G1000 / AI Innovators Bootcamp. Students browse and apply to real-world AI and automation projects posted by local business owners. Admins manage approvals, resources, and platform analytics.

## Tech Stack

| Layer       | Technology                                         |
|-------------|----------------------------------------------------|
| Framework   | Next.js 14 (App Router)                            |
| Language    | TypeScript (strict)                                |
| UI          | React 18, Tailwind CSS, Radix UI, Headless UI      |
| Database    | PostgreSQL via Supabase                            |
| Auth        | Supabase Auth (email + password) + JWT cookies     |
| Email       | SendGrid (`@sendgrid/mail`)                        |
| Charts      | Recharts                                           |
| Hosting     | Vercel                                             |

## Authentication

All three roles authenticate with **email + password**. There is no OTP flow, no email verification step, and no participant whitelist. Passwords are stored exclusively in Supabase Auth; the app issues its own JWT (signed with `JWT_SECRET`) and sets an `auth-token` HTTP-only cookie for session state.

| Role           | Login page        | Registration       | Notes                                                     |
|----------------|-------------------|--------------------|-----------------------------------------------------------|
| Student        | `/login`          | `/login` (toggle)  | Only `@babson.edu` emails accepted                        |
| Business Owner | `/business/login` | `/business/register` | Auto-approved (`is_approved = true`) on registration      |
| Admin          | `/admin/login`    | seeded manually    | Elevated role checked by middleware                       |

Route protection is enforced by `src/middleware.ts`, which verifies the JWT on every protected path and redirects unauthenticated users to the appropriate login page.

## Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/business/     # Business registration
│   │   │   ├── register/student/      # Student registration
│   │   │   ├── business/login/        # Business login
│   │   │   ├── student/login/         # Student login
│   │   │   ├── admin/login/           # Admin login
│   │   │   ├── logout/                # Clears auth cookie
│   │   │   └── me/                    # Current user lookup
│   │   ├── admin/                     # Admin endpoints
│   │   ├── business/                  # Business endpoints
│   │   ├── student/                   # Student endpoints
│   │   ├── opportunities/             # Public project listings
│   │   └── resources/                 # Learning resources
│   ├── admin/                         # Admin portal pages
│   ├── business/                      # Business portal pages
│   ├── student/                       # Student portal pages
│   ├── login/                         # Student login page
│   └── page.tsx                       # Landing page (routes users to portals)
├── components/              # Shared React components
│   └── ui/                  # Base UI primitives (Button, Card, Input, …)
├── lib/
│   ├── supabase.ts          # Client + admin (service role) clients, DB types
│   ├── auth.ts              # JWT signing / verification (Node runtime)
│   ├── auth-edge.ts         # Edge-compatible JWT verification (middleware)
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
- **Middleware** (`src/middleware.ts`) runs on the Edge runtime and uses `auth-edge.ts` to verify JWTs without Node-only dependencies (no bcrypt on the edge).
- **Auth flow** — on registration the API creates a user in Supabase Auth (`email_confirm: true`), mirrors the row into `users`, creates the role-specific profile row, signs a JWT, and sets the `auth-token` cookie. On login the API calls `signInWithPassword`, reloads the user row, and issues a fresh JWT.
- **UI** uses Tailwind with the custom tokens in `tailwind.config.js` (`generator-dark`, `generator-green`, `generator-gold`, `primary-*`). Shared primitives live in `src/components/ui/`.

## Deployment

Deployed on Vercel. Pushes to `main` trigger automatic deployments. See `VERCEL_DEPLOYMENT.md` for required environment variables and deployment notes.
