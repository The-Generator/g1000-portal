# Temporary Development Changes to Undo

This document tracks all temporary bypasses, mock data, and development-only configurations added to the codebase. Ensure **ALL** of these changes are reverted before proceeding to a production deployment!

---

### 1. Development Account Auth Bypass (`rkatsura1@babson.edu`)
**Files Affected:** 
- `src/app/api/auth/request-code/route.ts`
- `src/app/api/auth/verify-code/route.ts`

**Reasoning:** To drastically speed up local development and avoid running into Supabase's email rate limits, we built a backdoor for `rkatsura1@babson.edu` that ignores all database checks, skips the OTP email dispatch, and ignores session tracking.

#### Changes made in `src/app/api/auth/request-code/route.ts`:
- Added a `const isDevBypass = email.toLowerCase() === 'rkatsura1@babson.edu';` check.
- **To Undo:** Scroll to `Line ~22` and delete the `isDevBypass` check. Restore the section to immediately query the `g1000_participants` table. Scroll to `Line ~47` and remove the early return that bypasses `supabaseAdmin.auth.signInWithOtp`.

#### Changes made in `src/app/api/auth/verify-code/route.ts`:
- Added `const isDevBypass = email.toLowerCase() === 'rkatsura1@babson.edu' && code === '000000';`.
- Instead of using `supabase.auth.verifyOtp()`, we assign `user.id: '99999999-9999-9999-9999-999999999999'`.
- We assign a mock `participant` profile (Rustin Katsura (Dev)) instead of doing a database fetch.
- We completely bypass standard `public.users` table inserts to prevent foreign key errors with the fake UUID.
- We mock `has_set_password: true` so the frontend doesn't demand the user create a password.
- **To Undo:** Strip out all `if (isDevBypass)` blocks. Allow the code to natively resolve `supabase.auth.verifyOtp()`, parse the actual database `fetchError` blocks, and successfully push `newUser` objects into your database like normal.

#### Changes made in `src/app/api/auth/check-user/route.ts`:
- Added a `if (email.toLowerCase() === 'rkatsura1@babson.edu')` bypass that forces the `/login` page flow to assume you don't have a password. This triggers the OTP flow.
- **To Undo:** Remove the dev bypass `if` block near `Line ~16`.

#### Changes made in `src/lib/auth-edge.ts` and `src/lib/auth.ts`:
- Replaced the failing database fetch in `getUserFromRequest` with a hard bypass for payload IDs matching `99999999-9999-9999-9999-999999999999`. 
- **To Undo:** Scroll to approx `Line 175` (`auth-edge.ts`) and `Line 233` (`auth.ts`) and strip out the `// Dev Bypass Mock` injection block.

---

*(Append any future temporary hacks or bypasses here!)*
