# admin\_panel.spec.md

## Purpose

Defines the Administrator interface, data flows, and API contracts for managing users, business owner approvals, application-window overrides, and portal-wide settings.

---

## Screens & Routes

1. **Admin Dashboard** (`GET /admin/dashboard`)

   * **UI Elements**:

     * Overview cards: Pending Owner Approvals, Active Projects, Open Applications
     * Quick action links: “Approve Owners,” “Override Windows,” “User Management,” “Settings”
   * **Data**:

     * Aggregate counts via `GET /api/admin/metrics`

2. **Approve Business Owners** (`GET /admin/owners/pending` & `POST /api/admin/owners/{id}/approve`)

   * **UI Elements**:

     * Table of pending owners with columns: Company Name, Email, Industry Tags, Registration Date
     * Actions: Approve (✅), Reject (❌ with reason modal)
   * **API**:

     * `GET /api/admin/owners?status=pending`
     * `POST /api/admin/owners/{ownerId}/approve` → sets `isApproved=true`
     * `POST /api/admin/owners/{ownerId}/reject` → removes or flags owner

3. **Override Application Windows** (`GET /admin/projects` & `PUT /api/admin/projects/{id}/override-window`)

   * **UI Elements**:

     * List of all projects with current applyWindowStart and applyWindowEnd
     * Inline date pickers to adjust start/end values
     * Save button per project row
   * **API**:

     * `GET /api/admin/projects`
     * `PUT /api/admin/projects/{projectId}/override-window`

       * Body: `{ applyWindowStart: DateTime, applyWindowEnd: DateTime }`

4. **User Management** (`GET /admin/users` & `PUT /api/admin/users/{id}/role` & `DELETE /api/admin/users/{id}`)

   * **UI Elements**:

     * Searchable table: Name, Email, Role, Last Active, Actions (Edit Role, Deactivate)
     * Role dropdown (student, owner, admin)
     * Deactivate button with confirmation
   * **API**:

     * `GET /api/admin/users?search={query}`
     * `PUT /api/admin/users/{userId}/role` → body `{ role: Enum }`
     * `DELETE /api/admin/users/{userId}` → soft-delete account

5. **Portal Settings** (`GET /admin/settings` & `PUT /api/admin/settings`)

   * **UI Elements**:

     * Toggle features: Enable AI-scoring, Notification Channels (Email, Slack)
     * Brand settings: Update color palette and fonts
   * **API**:

     * `GET /api/admin/settings`
     * `PUT /api/admin/settings` → body `{ settings: JSON }`

---

## Data Model: Admin Metrics

| Metric Name          | Description                                 | API Endpoint         |
| -------------------- | ------------------------------------------- | -------------------- |
| pendingOwnerCount    | Number of unapproved business owners        | `/api/admin/metrics` |
| activeProjectCount   | Total projects with status `open`           | `/api/admin/metrics` |
| openApplicationCount | Number of applications in `submitted` state | `/api/admin/metrics` |
| userCountByRole      | Breakdown of users by role                  | `/api/admin/metrics` |

---

## Error Handling & UX

* **Confirmation Modals** for destructive actions (reject owner, delete user)
* **Inline Validation** for date overrides (end after start)
* **Toast Notifications** for success/failure of admin actions

---

> *This spec drives Claude Code to scaffold the admin panel UI and corresponding secure API endpoints.*
