# applicants\_workflow\.spec.md

## Purpose

Defines the end-to-end student application workflow for business-owner project listings, including submission, filtering, and bulk actions.

---

## Data Model: Application Object

| Field          | Type      | Description                                                            |
| -------------- | --------- | ---------------------------------------------------------------------- |
| id             | UUID      | Unique application identifier                                          |
| projectId      | UUID      | Associated project ID                                                  |
| studentId      | UUID      | Applicant student ID                                                   |
| coverNote      | Text      | Student’s personalized message to business owner                       |
| proofOfWorkUrl | URL       | Link to portfolio, GitHub repo, or project sample                      |
| status         | String    | One of: submitted, underReview, interviewScheduled, rejected, accepted |
| submittedAt    | DateTime  | Timestamp of submission                                                |
| invitedAt      | DateTime? | Timestamp when interview was scheduled                                 |
| rejectedAt     | DateTime? | Timestamp when application was rejected                                |

---

## API Contracts

### 1. Submit Application

* **Route**: `POST /api/business/projects/{projectId}/applications`
* **Body**:

  ```json
  {
    "coverNote": "<string>",
    "proofOfWorkUrl": "<url>",
    "studentId": "<uuid>"
  }
  ```
* **Response**: `201 Created`

  ```json
  {
    "id": "<uuid>",
    "projectId": "<uuid>",
    "status": "submitted",
    "submittedAt": "<timestamp>"
  }
  ```

### 2. Fetch Applications

* **Route**: `GET /api/business/projects/{projectId}/applications`
* **Response**: `200 OK`

  ```json
  [
    {
      "id": "...",
      "studentId": "...",
      "coverNote": "...",
      "proofOfWorkUrl": "...",
      "status": "submitted",
      "submittedAt": "..."
    },
    ...
  ]
  ```

### 3. Bulk Action Endpoint

* **Route**: `POST /api/business/projects/{projectId}/applications/bulk`
* **Body**:

  ```json
  {
    "action": "invite" | "reject",
    "applicationIds": ["<uuid>", ...],
    "meetingDateTime": "<iso-timestamp>"   // required when action=invite
  }
  ```
* **Response**: `200 OK` with updated statuses

---

## Filtering Rules

1. **Proof-of-Work Requirement**

   * Submissions without `proofOfWorkUrl` must be prevented client-side.

2. **Filter Options** (UI-level)

   * Submission date range
   * Status dropdown (e.g., Submitted, Interview Scheduled)

---

## UI Interactions

### Applicants Tab on Business Dashboard

* **Table / Card View**:

  * Columns: Photo, Name, Major, SubmittedAt, Status
* **Filters Panel**:

  * Date-range picker for submittedAt
  * Status filter dropdown
* **Row Actions**:

  * `Invite to Meeting` → opens inline calendar picker
  * `Reject` → shows confirm modal with optional reason field
* **Bulk Actions Toolbar**:

  * Select multiple → `Invite` / `Reject`
  * If `Invite`, prompt for a single `meetingDateTime` for all

---

## Error Handling & UX

* **Client-side**: Validate URL format for `proofOfWorkUrl`, non-empty `coverNote`.
* **Server-side**: Return `400` for validation errors, `401` for unauthorized, `500` for server failures.
* **UI**: Show inline field errors, toast notifications on bulk action success/failure.

---

> *This spec enables Claude Code to scaffold front-end components and back-end endpoints for application submission and management without AI integration.*
