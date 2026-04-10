# data\_model.spec.md

## Purpose

Defines the core domain entities, their fields, relationships, and validation rules for the G1000 Portal’s backend data model—simplified without AI-specific fields.

---

## Entities & Schemas

### 1. User

| Field     | Type     | Constraints / Description      |
| --------- | -------- | ------------------------------ |
| id        | UUID     | Primary key                    |
| email     | String   | Unique, validated email format |
| name      | String   | Non-empty                      |
| role      | Enum     | `student` / `owner` / `admin`  |
| createdAt | DateTime | Auto-generated                 |
| updatedAt | DateTime | Auto-updated                   |

### 2. StudentProfile

| Field              | Type      | Constraints / Description           |
| ------------------ | --------- | ----------------------------------- |
| userId             | UUID      | FK → User.id (role=`student`)       |
| bio                | Text      | Optional, max 1000 chars            |
| major              | String    | Pulled from verification, readonly  |
| year               | String    | e.g., `’26`, readonly               |
| linkedinUrl        | String    | Nullable, URL format                |
| githubUrl          | String    | Nullable, URL format                |
| personalWebsiteUrl | String    | Nullable, URL format                |
| resumeUrl          | String    | Nullable, URL to uploaded PDF       |
| skills             | String\[] | Tag list, each in allowed skill set |
| proofOfWorkUrls    | String\[] | Array of URLs to past projects      |
| updatedAt          | DateTime  | Auto-updated                        |

### 3. BusinessOwnerProfile

| Field        | Type      | Constraints / Description      |
| ------------ | --------- | ------------------------------ |
| userId       | UUID      | FK → User.id (role=`owner`)    |
| companyName  | String    | Required                       |
| industryTags | String\[] | List of industries             |
| websiteUrl   | String    | Nullable, URL format           |
| isApproved   | Boolean   | Default: `false`, set by admin |
| createdAt    | DateTime  | Auto-generated                 |
| updatedAt    | DateTime  | Auto-updated                   |

### 4. Project

| Field             | Type      | Constraints / Description                         |
| ----------------- | --------- | ------------------------------------------------- |
| id                | UUID      | Primary key                                       |
| ownerId           | UUID      | FK → User.id (role=`owner`)                       |
| title             | String    | Non-empty                                         |
| description       | Text      | Rich text                                         |
| industryTags      | String\[] | Required tags                                     |
| duration          | String    | Predefined ranges (`<4 weeks`, `4-8 weeks`, etc.) |
| deliverables      | String\[] | Bullet list                                       |
| compensationType  | Enum      | `stipend` / `equity` / `credit`                   |
| compensationValue | String    | Contextual value (e.g., `$500`, `1% equity`)      |
| applyWindowStart  | DateTime  | Required                                          |
| applyWindowEnd    | DateTime  | Required                                          |
| requiredSkills    | String\[] | Tag list                                          |
| status            | Enum      | `open` / `closed`                                 |
| createdAt         | DateTime  | Auto-generated                                    |
| updatedAt         | DateTime  | Auto-updated                                      |

### 5. Application

| Field             | Type      | Constraints / Description                                                    |
| ----------------- | --------- | ---------------------------------------------------------------------------- |
| id                | UUID      | Primary key                                                                  |
| projectId         | UUID      | FK → Project.id                                                              |
| studentId         | UUID      | FK → User.id (role=`student`)                                                |
| coverNote         | Text      | Required, max 500 chars                                                      |
| proofOfWorkUrl    | String    | Required, URL format                                                         |
| status            | Enum      | `submitted` / `underReview` / `interviewScheduled` / `accepted` / `rejected` |
| submittedAt       | DateTime  | Auto-generated                                                               |
| invitedAt         | DateTime? | Nullable                                                                     |
| rejectedAt        | DateTime? | Nullable                                                                     |
| meetingDateTime   | DateTime? | Nullable, scheduled meeting                                                  |
| reflectionOwner   | Text?     | Nullable, business owner feedback                                            |
| reflectionStudent | Text?     | Nullable, student feedback                                                   |

---

## Relationships

* `User 1–1 StudentProfile` (if role=`student`)
* `User 1–1 BusinessOwnerProfile` (if role=`owner`)
* `User 1–M Project` (owners create many projects)
* `Project 1–M Application` (projects receive many applications)
* `User 1–M Application` (students submit many applications)

---

## Validation Rules

* `applyWindowEnd` must be after `applyWindowStart`
* `compensationValue` required when `compensationType` set
* `skills`, `requiredSkills`, `industryTags` elements must be from predefined enums

---

> *This data model spec drives your ORM schema generation via Claude Code, now without AI-specific fields.*

