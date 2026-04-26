# Supabase SSR + Next.js App Router: Research Report

> **Generated:** 2026-04-26
> **Target project:** g1000-portal (Next.js 14.0.x, App Router)
> **Sources:** Official Supabase docs, npm registry, GitHub examples, migration guides

---

## 1. Package Versions to Install

```bash
npm install @supabase/ssr@^0.10.2 @supabase/supabase-js@^2.49.0
```

| Package | Latest Version | Notes |
|---------|---------------|-------|
| `@supabase/ssr` | **0.10.2** (2026-04-09) | Replaces all deprecated `@supabase/auth-helpers-*` packages |
| `@supabase/supabase-js` | **^2.49.x** | Current project has `^2.38.0` – should upgrade to latest v2 |

### What `@supabase/ssr` replaces:
- `@supabase/auth-helpers-nextjs` → `@supabase/ssr`
- `@supabase/auth-helpers-react` → `@supabase/ssr`
- `createMiddlewareClient` → `createServerClient`
- `createClientComponentClient` → `createBrowserClient`
- `createServerComponentClient` → `createServerClient`
- `createRouteHandlerClient` → `createServerClient`

---

## 2. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Note on key naming:** The latest Supabase docs reference `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (new `sb_publishable_xxx` format). However, the existing `NEXT_PUBLIC_SUPABASE_ANON_KEY` format still works and both the anon key and the new publishable key can be used during the transition period. **For this project, keep using `NEXT_PUBLIC_SUPABASE_ANON_KEY` unless migrating keys.**

---

## 3. File Structure

```
src/lib/supabase/          (or lib/supabase/ if no src/)
├── client.ts              # Browser client (Client Components)
├── server.ts              # Server client (Server Components, Server Actions, Route Handlers)
└── middleware.ts           # Middleware client (session refresh utility)

middleware.ts               # Next.js middleware entry point (project root or src/)
app/auth/callback/route.ts  # OAuth PKCE code exchange endpoint
```

---

## 4. Code Patterns

### ⚠️ CRITICAL: Next.js 14 vs 15+ Differences

The official Supabase docs now target **Next.js 15/16** which has two key differences from Next.js 14:

| Feature | Next.js 14 (this project) | Next.js 15+ |
|---------|--------------------------|-------------|
| `cookies()` from `next/headers` | **Synchronous** — `const store = cookies()` | **Async** — `const store = await cookies()` |
| Session refresh file | **`middleware.ts`** with `export function middleware()` | **`proxy.ts`** with `export function proxy()` |
| `createClient` in server.ts | Regular function (can be `async` or not) | Must be `async function` |

**All code patterns below are adapted for Next.js 14.**

---

### 4a. Browser Client — `src/lib/supabase/client.ts`

Used in Client Components (`'use client'`).

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Key points:**
- No cookie configuration needed — the browser client handles localStorage/cookies automatically
- Singleton-safe — `createBrowserClient` returns the same instance if called multiple times with the same args
- Use this in any `'use client'` component

---

### 4b. Server Client — `src/lib/supabase/server.ts`

Used in Server Components, Server Actions, and Route Handlers.

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()  // ← Synchronous in Next.js 14!

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

**Key points:**
- `cookies()` is **synchronous** in Next.js 14 — do NOT `await` it
- `setAll` will throw in Server Components (read-only context) — the `try/catch` is expected
- The middleware handles session refresh, so Server Components don't need to write cookies
- Create a **new client per request** — never store in a global/module-level variable
- The `setAll` second argument `headers` (for CDN cache-busting, added in v0.10.0) can be ignored in the server client since it's only relevant in middleware/proxy context

---

### 4c. Middleware Session Refresh Utility — `src/lib/supabase/middleware.ts`

This is the core utility that refreshes expired auth tokens on every request.

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          // Forward cache-control headers from @supabase/ssr v0.10.0+
          // to prevent CDN caching of responses with Set-Cookie
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // --- Role-based redirect logic goes HERE ---
  // Example: redirect unauthenticated users to login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/business/register')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it: const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies: myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the response to fit your needs, but avoid changing the cookies!
  // 4. Return it: return myNewResponse

  return supabaseResponse
}
```

**Key points about `setAll` second argument:**
- Added in `@supabase/ssr` v0.10.0 — the `headers` parameter contains cache-control headers (`Cache-Control`, `Expires`, `Pragma`) when a token refresh occurs
- These headers prevent CDN caching of responses that contain `Set-Cookie`
- Always forward them to the response via `supabaseResponse.headers.set(key, value)`

---

### 4d. Middleware Entry Point — `middleware.ts` (project root or `src/`)

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

> **Note:** In Next.js 14 this file MUST be named `middleware.ts` and export `middleware`. In Next.js 15+ it's been renamed to `proxy.ts` exporting `proxy`.

---

### 4e. OAuth Callback Route Handler — `app/auth/callback/route.ts`

This handles the PKCE code exchange after OAuth redirect (Google, etc.).

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    // Prevent open redirect attacks
    next = '/'
  }

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
```

---

## 5. Google OAuth Flow

### 5a. Supabase Dashboard Configuration

1. **Enable Google provider** in Supabase Dashboard → Authentication → Providers → Google
2. **Google Cloud Console** setup:
   - Create OAuth 2.0 Client ID (Web Application type)
   - **Authorized JavaScript origins:** `https://yourdomain.com` (and `http://localhost:3000` for dev)
   - **Authorized redirect URIs:** `https://<your-project-id>.supabase.co/auth/v1/callback`
     - For local dev: `http://127.0.0.1:54321/auth/v1/callback`
3. **Required scopes:** `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`

### 5b. Sign In with Google (PKCE Flow for SSR)

```typescript
// In a Client Component or Server Action
const supabase = createClient()  // browser client

await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: {
      access_type: 'offline',  // Optional: get refresh token
      prompt: 'consent',       // Optional: force consent screen
    },
  },
})
```

**Flow:**
1. User clicks "Sign in with Google" → `signInWithOAuth` redirects to Google
2. Google authenticates user → redirects to `https://<project>.supabase.co/auth/v1/callback`
3. Supabase processes the token → redirects to your `redirectTo` URL (`/auth/callback`) with `?code=xxx`
4. Your callback route handler exchanges the code: `exchangeCodeForSession(code)`
5. Session cookies are set → user is redirected to the app

### 5c. Redirect URLs Configuration

Add these to **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**:
- `http://localhost:3000/auth/callback` (development)
- `https://yourdomain.com/auth/callback` (production)

---

## 6. Email/Password Sign-In

### Server Action approach (recommended for App Router):

```typescript
// app/login/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
```

---

## 7. Session Verification Methods

### `getSession()` — ❌ DO NOT use for authorization

```typescript
// Returns session from cookies — NOT verified by Auth server
// Can be spoofed! Only use for non-sensitive UI rendering
const { data: { session } } = await supabase.auth.getSession()
```

### `getUser()` — ✅ Recommended for authorization (network call)

```typescript
// Contacts Supabase Auth server every time — returns verified, up-to-date user
const { data: { user } } = await supabase.auth.getUser()
```

### `getClaims()` — ✅ Faster alternative (local JWT validation)

```typescript
// Validates JWT locally using JWKS endpoint (no network call to Auth server)
// Returns verified JWT claims — safe for authorization decisions
const { data: { claims } } = await supabase.auth.getClaims()
```

**Recommendation for middleware:** Use `getUser()` for maximum reliability. Use `getClaims()` if you need lower latency and accept that it validates the JWT signature locally (does not check if user has been deleted/banned server-side since token was issued).

---

## 8. Cookie Configuration Details

### How cookies work with `@supabase/ssr`:
- Supabase stores tokens in cookies automatically (not localStorage)
- Cookie names follow the pattern: `sb-<project-ref>-auth-token`
- The token is split across multiple cookies if it exceeds 4KB (browser cookie size limit)
- `getAll()` / `setAll()` are the **only** cookie methods — individual `get`/`set`/`remove` are **DEPRECATED and will break**

### Cookie properties:
- **`SameSite`:** `Lax` (good default — sends cookies on navigation)
- **`Secure`:** `true` in production (HTTPS only), `false` for localhost
- **`HttpOnly`:** NOT required — both access and refresh tokens need to be accessible by the browser client
- **`Max-Age`:** Controlled by Supabase Auth (matches token expiry) — don't override with shorter values
- **`Path`:** `/` by default

---

## 9. Gotchas and Important Notes

### 🚨 Critical: Cookie method signature

**NEVER use the old individual cookie methods.** This is the #1 cause of broken auth:

```typescript
// ❌ WRONG — WILL BREAK
cookies: {
  get(name) { return cookieStore.get(name) },
  set(name, value) { cookieStore.set(name, value) },
  remove(name) { cookieStore.remove(name) },
}

// ✅ CORRECT — ALWAYS USE THIS
cookies: {
  getAll() { return cookieStore.getAll() },
  setAll(cookiesToSet) {
    cookiesToSet.forEach(({ name, value, options }) =>
      cookieStore.set(name, value, options)
    )
  },
}
```

### 🚨 Critical: Don't put code between `createServerClient` and `getUser()`/`getClaims()`

In the middleware utility, calling any code between client creation and auth check can cause random logouts.

### 🚨 Critical: Always return `supabaseResponse` from middleware

If you create a new `NextResponse`, you MUST:
1. Pass the `request` to it: `NextResponse.next({ request })`
2. Copy cookies: `newResponse.cookies.setAll(supabaseResponse.cookies.getAll())`
3. Return the new response

Failure to do this causes browser/server cookie desync → random logouts.

### 🚨 Important: Concurrent requests with expired sessions

Supabase refresh tokens are **single-use**. If two requests arrive with the same expired session (e.g., two browser tabs), the second request's refresh will fail. The middleware pattern mitigates this for navigations, but parallel `fetch()` calls should handle `null` sessions gracefully.

### 🚨 Important: ISR / CDN caching

- **Never enable ISR** on routes that handle authentication
- Use `export const dynamic = 'force-dynamic'` on authenticated pages
- v0.10.0+ automatically passes cache-control headers via the `setAll` `headers` parameter
- Manually add `Cache-Control: private, no-store` if on older versions

### 🚨 Important: Next.js route prefetching

`<Link>` prefetching and `Router.push()` can send server requests before the browser processes tokens. After OAuth sign-in, redirect to a page without prefetching first, then navigate normally.

### 🚨 Important: Vercel Fluid Compute

Never store the Supabase client in a module-level variable. Always create a new client inside the request handler.

### ⚠️ `cookies()` is synchronous in Next.js 14

The official docs show `await cookies()` — this is for Next.js 15+. In Next.js 14, call `cookies()` without `await`.

### ⚠️ `middleware.ts` vs `proxy.ts`

- **Next.js 14:** Use `middleware.ts` exporting `middleware` function
- **Next.js 15+:** Use `proxy.ts` exporting `proxy` function
- The internal `updateSession` utility is identical in both cases

---

## 10. Version Compatibility Matrix

| `@supabase/ssr` | `@supabase/supabase-js` | Key Changes |
|-----------------|------------------------|-------------|
| 0.10.x | ^2.49.x | `setAll` gets `headers` 2nd arg for CDN cache control |
| 0.5.x – 0.9.x | ^2.38.x+ | `getAll`/`setAll` cookie pattern (current standard) |
| < 0.5.x | ^2.x | Older `get`/`set`/`remove` pattern (DEPRECATED) |

### `getClaims()` availability:
- Available in `@supabase/supabase-js` v2.x (recent versions)
- Validates JWT using the project's JWKS endpoint (local validation, no auth server call)
- Falls back to auth server call if asymmetric keys aren't configured

---

## 11. Migration Checklist (for this project)

This project currently uses custom JWT auth (`jose` library, `bcryptjs`). Here's what needs to happen:

1. **Install packages:** `npm install @supabase/ssr@^0.10.2` (supabase-js already installed but should upgrade)
2. **Create utility files:**
   - `src/lib/supabase/client.ts` (browser client)
   - `src/lib/supabase/server.ts` (server client)
   - `src/lib/supabase/middleware.ts` (middleware utility)
3. **Create middleware:** `src/middleware.ts` (or project root) — calls `updateSession`
4. **Create callback route:** `src/app/auth/callback/route.ts` — handles PKCE code exchange
5. **Configure Google OAuth:** Supabase Dashboard + Google Cloud Console
6. **Replace custom auth:** Swap `jose` JWT verification with Supabase `getUser()`/`getClaims()`
7. **Update login/register pages:** Use `signInWithPassword`, `signUp`, `signInWithOAuth`
8. **Remove custom middleware:** Replace existing JWT-based auth middleware with Supabase middleware
9. **Test thoroughly:** Session refresh, OAuth flow, role-based redirects, concurrent requests

---

## 12. Reference Links

- [Official SSR Client Setup (Next.js)](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs)
- [Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Advanced SSR Guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide)
- [Login with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Migration from Auth Helpers to SSR](https://supabase.com/docs/guides/troubleshooting/how-to-migrate-from-supabase-auth-helpers-to-ssr-package-5NRunM)
- [Auth Quickstart for Next.js](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [AI Prompt: Next.js + Supabase Auth](https://supabase.com/docs/guides/getting-started/ai-prompts/nextjs-supabase-auth)
- [npm: @supabase/ssr](https://www.npmjs.com/package/@supabase/ssr)
- [GitHub: Official Next.js Auth Example](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
- [getClaims() API Reference](https://supabase.com/docs/reference/javascript/auth-getclaims)
