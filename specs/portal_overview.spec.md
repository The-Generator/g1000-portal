# portal\_overview\.spec.md

## Overview

This document describes the high-level end-to-end user flows and interactions for the G1000 student–business matching portal, covering both the Business Owner and Student portals. It serves as the primary spec for agents to scaffold core routes, components, and workflows.

---

## User Roles

1. **Student** (G1000 AI Innovators Bootcamp alumni)

   * Creates and manages personal profile
   * Browses and applies to business opportunities
   * Tracks application status and schedules meetings
   * Provides post-project reflections

2. **Business Owner** (small business owner who ran an AI Innovators Bootcamp)

   * Registers and verifies eligibility
   * Creates, edits, and manages project listings
   * Reviews applications and schedules interviews
   * Provides post-project feedback

3. **Administrator** (Cathy / Generator team)

   * Approves business registrations
   * Overrides application windows
   * Monitors portal analytics and metrics

---

## High-Level Flows

### 1. Onboarding & Authentication

- **Landing Page**: Public overview of portal features and eligibility.
- **Sign-Up / Sign-In**:
  - Students enter their `@babson.edu` email on `/login`.
  - System checks that the email exists in the admin-managed “G1000 Participants” table.
  - If found, a one-time verification code is emailed.
  - Student submits the code on `/login/verify`; on success, a session is created with role `student`.
  - Business Owners register with email and password on `/owner/register`; registrations go into a “pending” state until an admin approves them.
  - Administrators log in with email and password on `/admin/login`, validated against the `Admins` table.


### 2. Business Owner Portal

* **Dashboard Home**: List of current projects with status badges
* **Create Project**: Form captures title, description, skills, timeline, compensation, and application window
* **Edit Project**: In-place form editing for project details
* **View Applicants**: Tabular view of student applications with filters and bulk actions
* **Schedule Interviews**: Embedded calendar picker to invite candidates
* **Close Project**: Marks listing as closed and triggers reflection prompt

### 3. Student Portal

* **Profile Setup**: Bio, LinkedIn/GitHub links, resume upload, skills tags, proof-of-work gallery
* **Opportunities Feed**: Search, filter, and browse open projects
* **Apply to Project**: Submission form with cover note and proof-of-work link
* **Track Applications**: Status timeline and interview scheduling
* **Complete Project**: Post-project reflection and portfolio update

### 4. Notifications & Communication

* Real-time in-app badges and email alerts for new listings and status changes
* Cohort-wide announcements via Slack or email blast

### 5. Analytics & Admin

* **Admin Panel**: User and listing approvals, window overrides
* **Metrics Dashboard**: Opportunities posted, applications per listing, time-to-match, satisfaction scores

---

## Brand & Design Guidelines

* **Colors**: #006744, #789b4a, #5bbbb7, white, black
* **Fonts**: Trade Gothic Condensed, Caecilia LT Std

> *Note: Detailed UI specs will be defined in individual component spec files (e.g., business\_dashboard\_ui.spec.md).*
