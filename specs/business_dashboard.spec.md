# business\_dashboard.spec.md

## Purpose

Defines the Business Owner Dashboard user interface screens, interactions, and API contracts for creating, reading, updating, and deleting project listings.

---

## Screens & Routes

1. **Dashboard Home** (`GET /business/projects`)

   * **UI Elements**:

     * Header: “My Projects” title + “New Project” button
     * Project Cards Grid or List

       * Card: Title, Industry Tag, Status Badge, Key Info Icons (🕒 window, 💰 compensation)
       * Hover Actions: Edit (✏️), View Analytics (📊), Delete (🗑️)
   * **Data**:

     * Fetch list of projects owned by current user via `GET /api/business/projects`

2. **Create Project** (`GET /business/projects/new` & `POST /api/business/projects`)

   * **UI Elements**:

     * Smart Form fields: Title, Description (rich text), Industry (dropdown), Duration, Deliverables, Compensation Type & Amount, Application Window (start/end date), Required Skills (tag input)
     * Submit Button: “Create Project”
   * **API**:

     * `POST /api/business/projects`

       * Body: `title`, `description`, `industry`, `duration`, `deliverables`, `compensationType`, `compensationValue`, `applyWindowStart`, `applyWindowEnd`, `skills[]`
       * Response: Created project object with `id`

3. **Edit Project** (`GET /business/projects/[id]/edit` & `PUT /api/business/projects/[id]`)

   * **UI Elements**:

     * Pre-populated form identical to Create Project
     * Buttons: “Save Changes”, “Close Project”
   * **API**:

     * `GET /api/business/projects/[id]`: fetch single project details
     * `PUT /api/business/projects/[id]`

       * Body same as POST fields
       * Response: Updated project object

4. **Delete Project** (`DELETE /api/business/projects/[id]`)

   * **UI**: Confirmation modal before deletion
   * **API**:

     * `DELETE /api/business/projects/[id]`

       * Response: Success status

5. **View Applicants** (`GET /business/projects/[id]/applicants`)

   * **UI Elements**:

     * Tabular/List view of applicants (rows/cards)
     * Filters: Skill tags, Vetting Score slider
     * Bulk action toolbar: Invite to Meeting, Reject
   * **API**:

     * `GET /api/business/projects/[id]/applications`

       * Response: Array of application objects with `studentId`, `name`, `skills[]`, `proofOfWorkUrl`, `status`, `submittedAt`

6. **Invite to Meeting** (`POST /api/business/projects/[id]/applications/[appId]/invite`)

   * **UI**: Inline calendar picker for scheduling
   * **API**:

     * Body: `meetingDateTime`
     * Response: Updated application status (`interviewScheduled`) and meeting link

7. **Reject Application** (`POST /api/business/projects/[id]/applications/[appId]/reject`)

   * **UI**: Optional reason input
   * **API**:

     * Body: `reason` (optional)
     * Response: Updated application status (`rejected`)

---

## Error Handling

* Display inline form validation errors
* Toast notifications for API success/failure

---

> *Next: applicants\_workflow\.spec.md will detail the vetting and filtering processes.*
