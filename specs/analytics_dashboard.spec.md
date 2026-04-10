# analytics\_dashboard.spec.md

## Purpose

Defines the metrics, data visualizations, and API contracts for the Analytics Dashboard used by Administrators to monitor portal performance and user engagement—simplified without AI-specific metrics.

---

## Screens & Routes

1. **Analytics Dashboard Home** (`GET /admin/analytics`)

   * **UI Elements**:

     * **Metric Cards**:

       * **Total Opportunities**: Count of all projects (open and closed)
       * **Total Applications**: Count of all student submissions
       * **Avg Time-to-Match**: Average number of days from project posting to first interview scheduled
     * **Charts Section**:

       * **Bar Chart**: Applications per Opportunity over time
       * **Line Chart**: New User Registrations (Students vs. Owners) by week
       * **Pie Chart**: Distribution of Projects by Industry
     * **Export Button**: Download CSV of raw metrics
   * **Data**:

     * Fetched via `GET /api/admin/analytics`

2. **Detailed Reports** (`GET /admin/analytics/reports/{reportType}`)

   * **Available Reports**:

     * `opportunityApplications` → table of opportunities with counts and avg time-to-match
     * `userActivity` → table of users with lastLogin, applicationCount, projectCount
   * **UI Elements**:

     * Filter by date range, roles, status
     * Paginated table with sortable columns

---

## API Contracts

### 1. Fetch Dashboard Metrics

* **Route**: `GET /api/admin/analytics`
* **Response**: `200 OK`

  ```json
  {
    "totalOpportunities": 42,
    "totalApplications": 128,
    "avgTimeToMatch": 3.5,           // days
    "applicationsOverTime": [
      { "date": "2025-06-01", "count": 5 },
      ...
    ],
    "newRegistrations": [
      { "date": "2025-05-01", "students": 10, "owners": 2 },
      ...
    ],
    "projectsByIndustry": [
      { "industry": "Retail", "count": 12 },
      ...
    ]
  }
  ```

### 2. Fetch Detailed Reports

* **Route**: `GET /api/admin/analytics/reports/{reportType}`
* **Query Params**: `startDate`, `endDate`, `filter` etc.
* **Response**: Tabular JSON depending on `reportType`

---

## Data Model: Analytics

| Field            | Type     | Description                      |
| ---------------- | -------- | -------------------------------- |
| date             | Date     | Date of metric                   |
| count            | Integer  | Application or opportunity count |
| students         | Integer  | New student registrations        |
| owners           | Integer  | New owner registrations          |
| industry         | String   | Industry category                |
| lastLogin        | DateTime | User last login timestamp        |
| applicationCount | Integer  | Total applications by user       |
| projectCount     | Integer  | Total projects by owner          |

---

## Visualizations & UX

* **Charts Library**: Recharts or Chart.js
* **Interactive Elements**:

  * Hover tooltips showing exact values
  * Toggle chart types (bar/line) for applicationsOverTime
* **Export**:

  * CSV download via `GET /api/admin/analytics/export?reportType=...`

---

> *This spec guides the agent in building the analytics UI, chart components, and data endpoints without AI-specific metrics.*
