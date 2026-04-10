# testing.spec.md

## Purpose

Defines test scenarios and specifications for unit, integration, and end-to-end tests to ensure reliability of core portal functionalities.

---

## Test Suites

### 1. Unit Tests

#### Services & Utilities

* **Auth Service**

  * Validate SSO callback parsing
  * JWT token generation and verification
* **API Handlers**

  * CRUD operations for Projects, Applications, Users
  * Notification dispatch functions
* **Data Model Validation**

  * Enforce schema rules (e.g., applyWindowEnd > applyWindowStart)
  * Skills and industry tag enums enforcement

### 2. Integration Tests

#### API Endpoints

* **Auth Routes**

  * `POST /api/auth/login/owner` → valid and invalid credentials
  * `GET /api/auth/me` → session vs. no session
* **Business Dashboard**

  * `POST /api/business/projects` → create project, verify in DB
  * `PUT /api/business/projects/{id}` → update fields, verify change
  * `GET /api/business/projects/{id}/applications` → return correct applications
* **Student Portal**

  * `POST /api/student/opportunities/{id}/apply` → valid application, duplicate rejection
  * `GET /api/student/applications` → returns student’s applications
* **Scheduling**

  * `GET /api/business/availability` → returns slots
  * `POST /api/business/applications/{id}/invite` → schedules meeting

### 3. End-to-End (E2E) Tests

Using Playwright / Cypress:

* **Login Flow**

  * Student SSO sign-in → access dashboard
  * Owner login → access business dashboard
* **Project Lifecycle**

  * Owner creates a project → student sees it in feed
  * Student applies → owner sees application and schedules interview
  * Student receives meeting invite and can view details
* **Notification Flow**

  * New opportunity triggers student in-app badge and email (mock)
  * Application status changes trigger student notifications

---

## Test Data & Fixtures

* **Users**: sample student, owner, admin accounts with known credentials
* **Projects**: seed data for projects with varied statuses
* **Applications**: pre-seeded applications with different statuses

---

## CI Integration

* Run **Unit** and **Integration** tests on every PR
* **E2E** tests on `main` branch merges
* Use headless mode with parallelization

---

> *This spec allows agent-driven generation of test files and CI configurations.*
