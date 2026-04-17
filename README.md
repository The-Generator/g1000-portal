# G1000 Portal

A student-business matching platform for the Babson G1000 / AI Innovators Bootcamp. Students browse and apply to real-world AI and automation projects posted by local business owners. Admins manage approvals, resources, and platform analytics.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI | React 18, Tailwind CSS, Radix UI, Headless UI |
| Database | PostgreSQL via Supabase |
| Auth | Custom JWT (jose) + email OTP for students, email/password for owners & admins |
| Email | SendGrid (@sendgrid/mail) |
| Charts | Recharts |
| Hosting | Vercel |

## Project Structure

```
src/
├── app/                     # Next.js App Router pages & API routes
│   ├── api/                 # REST API endpoints
│   │   ├── auth/            # Auth endpoints (login, register, OTP, etc.)
│   │   ├── admin/           # Admin API routes
│   │   ├── business/        # Business owner API routes
│   │   ├── student/         # Student API routes
│   │   ├── opportunities/   # Public project listings
│   │   ├── resources/       # Learning resources
│   │   └── seed/            # Seeding endpoints
│   ├── admin/               # Admin portal (dashboard, students, resources, whitelist)
│   ├── business/            # Business portal (dashboard, projects, profile, register)
│   ├── student/             # Student portal (dashboard, opportunities, applications, profile)
│   └── login/               # Student login page
├── components/              # Shared React components
│   └── ui/                  # Base UI primitives (Button, Card, Input)
├── lib/                     # Core libraries
│   ├── supabase.ts          # Supabase client setup & DB type definitions
│   ├── auth.ts              # JWT signing, verification, password hashing
│   ├── auth-edge.ts         # Edge-compatible auth (no bcrypt, for middleware)
│   ├── email.ts             # SendGrid email sending
│   ├── emailTemplates.ts    # HTML email templates
│   └── utils.ts             # Helpers (date formatting, transforms, validation)
├── types/index.ts           # TypeScript interfaces & constants
├── db/                      # Migration docs
└── middleware.ts             # Route protection & role-based access control
```

## Authentication

| Role | Method | Entry Point |
|------|--------|-------------|
| Student | Email OTP (@babson.edu only) | `/login` |
| Business Owner | Email + Password | `/business/login` (register at `/business/register`) |
| Admin | Email + Password | `/admin/login` |

Sessions are JWT tokens stored in HTTP-only cookies (24h expiry). Middleware enforces role-based route protection.

## Database

PostgreSQL hosted on Supabase. Core tables:

- `users` -- all accounts (id, email, name, role)
- `student_profiles` -- bio, major, year, skills, availability, links
- `business_owner_profiles` -- company info, approval status
- `projects` -- opportunity listings with type, compensation, skills, deadlines
- `applications` -- student applications with status workflow
- `g1000_participants` -- student eligibility whitelist
- `resources` / `support_documents` -- learning materials
- `verification_codes` -- OTP codes with TTL

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- SendGrid API key (for emails)

### Setup

```bash
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
JWT_SECRET=<random-secret>
SENDGRID_API_KEY=<your-sendgrid-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint
npm run type-check # TypeScript check
```

## Deployment

Deployed on Vercel. Push to `main` triggers automatic deployment. Environment variables must be set in Vercel dashboard.

---

## Known Issues & Technical Debt

See `FOUNDATIONAL_ISSUES.md` for a detailed audit of security vulnerabilities, architecture problems, and cleanup tasks.
