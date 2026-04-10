# auth.spec.md

## Purpose

Defines the authentication and authorization flows for the G1000 Portal, ensuring only eligible users (G1000 students, business owners, and admins) can access their respective sections via email verification or credentials.

---

## User Types & Credentials

| Role           | Credentials                         | Verification Method                                                                   |
| -------------- | ----------------------------------- | ------------------------------------------------------------------------------------- |
| Student        | Babson (`@babson.edu`) email + code | Email must appear in the “G1000 Participants” table; one-time code emailed to address |
| Business Owner | Email & Password                    | Standard signup; account pending until admin approves (`isApproved` flag)             |
| Administrator  | Email & Password                    | Pre-provisioned in the `Admins` table                                                 |

---

## Authentication Flow

1. **Entry Point**

   * **Students**: `/login` page—enter Babson email and click “Send Code.”
   * **Owners**: `/owner/login`—enter email/password.
   * **Admins**: `/admin/login`—enter email/password.

2. **Student Email Verification**

   * **Request Code** (`POST /api/auth/request-code`)

     * Body: `{ "email": "student@babson.edu" }`
     * Checks `G1000Participants` table; if not found or not `@babson.edu`, return `404 Not Registered`.
     * Generates 6-digit code, stores hashed with TTL, sends via email (SendGrid).
   * **Verify Code** (`POST /api/auth/verify-code`)

     * Body: `{ "email": "student@babson.edu", "code": "123456" }`
     * On success: issue JWT access & refresh tokens, set HTTP-only secure cookies with `role: student`.
     * On failure: return `400 Invalid Code`.

3. **Business Owner Login**

   * **Route**: `POST /api/auth/login/owner`
   * **Body**: `{ "email": "owner@example.com", "password": "••••••" }`
   * Validates credentials against `Owners` table; if `isApproved=false`, return `403 Awaiting Approval`.
   * On success: issue JWT cookies with `role: owner`.

4. **Administrator Login**

   * **Route**: `POST /api/auth/login/admin`
   * **Body**: `{ "email": "admin@babson.edu", "password": "••••••" }`
   * Validates against `Admins` table.
   * On success: issue JWT cookies with `role: admin`.

5. **Logout & Refresh**

   * **Logout**: `POST /api/auth/logout` clears tokens.
   * **Refresh**: `POST /api/auth/refresh` issues a new access token using a valid refresh token.

---

## Middleware & Session Management

* **Protect Routes** based on JWT claims:

  * `/student/*` → `role === 'student'`
  * `/business/*` → `role === 'owner'`
  * `/admin/*`    → `role === 'admin'`

* **Session Storage**: HTTP-only, secure cookies for access & refresh tokens.

* **Token Expiry**:

  * Access tokens: 8 hours
  * Refresh tokens: 30 days, rotate on use.

---

## API Endpoints Summary

| Route                    | Method | Description                               | Auth                |
| ------------------------ | ------ | ----------------------------------------- | ------------------- |
| `/api/auth/request-code` | POST   | Send one-time code to student email       | None                |
| `/api/auth/verify-code`  | POST   | Verify student code and establish session | None                |
| `/api/auth/login/owner`  | POST   | Owner email/password login                | None                |
| `/api/auth/login/admin`  | POST   | Admin email/password login                | None                |
| `/api/auth/logout`       | POST   | Clear session cookies                     | Any                 |
| `/api/auth/refresh`      | POST   | Refresh access token                      | Valid refresh token |
| `/api/auth/me`           | GET    | Return current user profile and role      | Any                 |

---

## Error Handling & UX

* Clear inline errors for invalid input (e.g., “Invalid code”, “Not registered”).
* Toast notifications for success and failure.
* “Contact Admin” link on restricted-access errors.

---

> *Implementation will leverage NextAuth.js Credentials Provider (for owners/admins) and custom email-code logic for students.*
