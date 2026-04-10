# notifications.spec.md

## Purpose

Specifies in-app and external notification behaviors for key events in both Business Owner and Student portals, ensuring timely communication about new opportunities, application status changes, and meeting schedules.

---

## Notification Types & Triggers

| Trigger                                       | Recipient      | Channel                              | Content Summary                                             |
| --------------------------------------------- | -------------- | ------------------------------------ | ----------------------------------------------------------- |
| New Opportunity Posted                        | All Students   | In-App badge, Email, Slack webhook   | "New project: \[Title] in \[Industry] is now open."         |
| Application Submitted                         | Business Owner | In-App badge, Email                  | "\[Student Name] applied to \[Project Title]."              |
| Application Status Changed (Interview/Reject) | Student        | In-App badge, Email                  | "Your application for \[Title] is now \[Status]."           |
| Interview Scheduled                           | Student, Owner | In-App badge, Calendar invite, Email | "Interview scheduled on \[Date/Time] for \[Project Title]." |
| Interview Reminder (24h before)               | Student, Owner | Email                                | "Reminder: Interview tomorrow at \[Time]."                  |
| Project Closed                                | Owner          | In-App toast                         | "Your project \[Title] has been successfully closed."       |
| Reflection Requested                          | Student, Owner | In-App badge, Email                  | "Please complete your reflection for \[Project Title]."     |

---

## Channels & Integration

1. **In-App Notifications**

   * **UI Components**:

     * Bell icon in header with red dot badge for new items
     * Dropdown list with latest 5 notifications and "View All" link
     * Notification center page: paginated list, mark-as-read, mark-all-read
   * **API**:

     * `GET /api/notifications?status={unread|all}`
     * `PUT /api/notifications/{id}/read`
     * `PUT /api/notifications/read-all`

2. **Email**

   * **Provider**: SendGrid or Postmark
   * **Templates**:

     * Use Handlebars or MJML templates in `/ai_docs/email_templates/`
   * **API**:

     * `POST /api/notifications/email` (internal use) with `{ to, subject, bodyHtml }`

3. **Slack Webhook**

   * **Endpoint**: Configurable Slack channel for cohort announcements
   * **Payload**: JSON with `text` and optional attachments
   * **API**:

     * `POST /api/notifications/slack` with `{ message, channel }`

4. **Calendar Invites**

   * Generate iCal (.ics) content server-side and attach to email
   * Provide “Add to Calendar” link in UI

---

## Data Model: Notification Object

| Field     | Type     | Description                                           |
| --------- | -------- | ----------------------------------------------------- |
| id        | UUID     | Unique notification identifier                        |
| userId    | UUID     | Recipient user ID                                     |
| type      | String   | Enum of notification types                            |
| data      | JSON     | Contextual payload (e.g., `{ projectId, studentId }`) |
| isRead    | Boolean  | Read status                                           |
| createdAt | DateTime | Timestamp                                             |

---

## Error Handling & UX

* **Retries**: Exponential backoff for webhook and email failures
* **Fallback**: If Slack fails, log and continue without blocking main flow
* **User Feedback**: Show toast on notification send failures for critical actions

---

> *This spec enables the agent to scaffold the notification center UI, email/slack integrations, and API endpoints without AI-score notifications.*

