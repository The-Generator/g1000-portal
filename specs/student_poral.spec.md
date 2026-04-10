# student\_portal.spec.md

## Purpose

Defines the student-facing portal interfaces, data flows, and API contracts for profile management, opportunity browsing, application submission, and project tracking.

---

## Screens & Routes

1. **Dashboard Home** (`GET /student/dashboard`)

   * **UI Elements**:

     * Welcome banner with student’s name and cohort badge
     * Quick stats: Applications submitted, Interviews scheduled, Projects completed
     * Shortcut buttons: “Edit Profile,” “Browse Opportunities,” “My Applications”
   * **Data**:

     * Fetch student stats via `GET /api/student/me`

2. **Profile Setup & Edit** (`GET /student/profile` & `PUT /api/student/profile`)

   * **UI Elements**:

     * Editable fields: Bio, Major & Year (readonly), LinkedIn, GitHub, Portfolio Links
     * Uploads: Resume (PDF), Portfolio artifacts gallery (PDF, images, links)
     * Skills: Tag-based input with autosuggest
     * Proof-of-Work Gallery: links to previous AI/automation projects
     * Save Button: “Update Profile”
   * **API**:

     * `GET /api/student/profile` → returns full profile
     * `PUT /api/student/profile` → accepts updates to bio, links, files, skills

3. **Opportunities Feed** (`GET /student/opportunities`)

   * **UI Elements**:

     * Search bar (keyword)
     * Filters: Industry, Skills required, Compensation type, Timeline
     * Opportunity cards with: Title, Short description, Industry tag, Compensation icon, “Apply” button
   * **Data**:

     * `GET /api/opportunities?filters...`

4. **Opportunity Details & Apply** (`GET /student/opportunities/[id]` & `POST /api/student/opportunities/[id]/apply`)

   * **Details Page**:

     * Full project spec, desired skills, timeline, compensation details, owner info
     * Apply button opens application modal
   * **Application Modal/Form**:

     * Cover Note input (required)
     * Proof-of-Work URL input (required)
     * Submit button: “Send Application”
   * **API**:

     * `POST /api/student/opportunities/{id}/apply`

       * Body: `{ coverNote, proofOfWorkUrl }`
       * Response: application object with status and aiScore

5. **My Applications** (`GET /student/applications`)

   * **UI Elements**:

     * Table or timeline cards showing each application’s status
     * Columns: Project title, Owner name, Status badge, aiScore, Actions (View Details)
   * **Data**:

     * `GET /api/student/applications`

6. **Interview Scheduling**

   * **Flow**:

     * If application status is `interviewScheduled`, display meeting details with link
     * Allow rescheduling via calendar picker (calls `PUT /api/student/applications/{id}/reschedule`)

7. **Post-Project Reflection** (`POST /api/student/applications/{id}/reflection`)

   * **UI**: Reflection form after project status `accepted` or `completed`

     * Questions: What went well? Key learnings? Suggestions
   * **API**:

     * `POST /api/student/applications/{id}/reflection` → saves feedback

---

## Data Model: Student Profile

| Field          | Type      | Description                             |
| -------------- | --------- | --------------------------------------- |
| id             | UUID      | Unique student identifier               |
| name           | String    | Full name from SSO                      |
| email          | String    | Babson email                            |
| bio            | Text      | Personal description                    |
| major          | String    | Pulled from Babson directory            |
| year           | String    | e.g., “’26”                             |
| links          | Object    | `{ linkedin, github, personalWebsite }` |
| resumeUrl      | URL       | Uploaded PDF                            |
| skills\[]      | \[String] | List of tagged skills                   |
| proofOfWork\[] | \[URL]    | Gallery of past project links           |

---

## Error Handling & UX

* **Client-side Validation**: Required fields, URL formatting, file size/type checks
* **Server Responses**: `400` for invalid input, `401` for unauthorized, `500` for errors
* **User Feedback**: Inline form errors, toast messages for actions

---

> *This spec primes the agent to scaffold the student portal’s UI components and API handlers.*
