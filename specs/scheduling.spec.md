# scheduling.spec.md

## Purpose

Defines how meeting scheduling is integrated within both Business Owner and Student portals, covering UI components and API contracts for creating, viewing, and rescheduling interviews.

---

## Screens & Components

1. **Inline Scheduler (Owner View)**

   * **Location**: Business Dashboard → Applicants Tab → Invite to Meeting action
   * **UI Elements**:

     * Date picker (calendar grid) showing owner’s available dates
     * Time slots dropdown / grid fetched from owner availability API
     * Confirmation button: “Send Invite”
   * **Interactions**:

     * On date selection, fetch available slots: `GET /api/business/availability?date={YYYY-MM-DD}`
     * On time slot selection and confirm, call `POST /api/business/applications/{appId}/invite` with `{ meetingDateTime }`

2. **Interview Details (Student View)**

   * **Location**: My Applications → application with status `interviewScheduled`
   * **UI Elements**:

     * Display meeting date/time and link
     * Buttons: “Add to Calendar” (iCal download), “Reschedule”
   * **Interactions**:

     * Reschedule opens scheduler component in student context
     * On reschedule confirm, call `PUT /api/student/applications/{appId}/reschedule` with `{ meetingDateTime }`

3. **Calendar Aggregation (Admin View)**

   * **Location**: Admin Panel → Scheduling Analytics
   * **UI Elements**:

     * Month view calendar overlay of all scheduled interviews
     * Filters: By Project, By Student, By Owner

---

## Availability & Slots API

### 1. Fetch Owner Availability

* **Route**: `GET /api/business/availability`
* **Query Params**: `date=YYYY-MM-DD`
* **Response**: `200 OK`

  ```json
  {
    "date": "2025-06-22",
    "slots": ["2025-06-22T09:00:00Z", "2025-06-22T10:00:00Z", ...]
  }
  ```

### 2. Invite to Meeting (Owner)

* **Route**: `POST /api/business/applications/{appId}/invite`
* **Body**:

  ```json
  { "meetingDateTime": "ISO-timestamp" }
  ```
* **Response**: `200 OK`

  ```json
  { "applicationId": "uuid", "status": "interviewScheduled", "meetingLink": "url" }
  ```

### 3. Reschedule (Student)

* **Route**: `PUT /api/student/applications/{appId}/reschedule`
* **Body**:

  ```json
  { "meetingDateTime": "ISO-timestamp" }
  ```
* **Response**: `200 OK`

  ```json
  { "applicationId": "uuid", "status": "interviewScheduled", "meetingLink": "url" }
  ```

---

## Error Handling

* `400 Bad Request` for invalid timestamps
* `409 Conflict` if slot no longer available
* `401 Unauthorized` if not owner/student

---

> *This spec informs Claude Code on building scheduler components and availability endpoints.*
