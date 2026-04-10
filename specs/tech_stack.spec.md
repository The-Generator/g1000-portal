# tech\_stack.spec.md

## Purpose

Outlines the recommended technology stack for the G1000 student–business matching portal in plain language, explaining each component and why it was chosen to accelerate development and ensure reliability.

---

## 1. Supabase (Backend & Auth)

* **What it is:** A hosted service providing a Postgres database, authentication, and file storage—all managed for you.
* **Why we use it:**

  * **Database:** Securely store users, projects, and applications without setting up servers.
  * **Auth:** Built-in email verification handles student sign-ups and sign-in codes.
  * **APIs & Storage:** Automatically generate endpoints and store resumes or portfolios.

---

## 2. Next.js + React (Web Framework & UI)

* **What it is:**

  * **Next.js:** A framework that combines server-side and client-side code in one project.
  * **React:** A library for creating interactive UI components like buttons, lists, and modals.
* **Why we use it:**

  * **Unified Codebase:** Build both pages and API routes together.
  * **Fast Deployment:** Push to Vercel and live updates with zero maintenance.

---

## 3. Tailwind CSS (Styling)

* **What it is:** A utility-first CSS toolkit giving you pre-defined classes (e.g., `p-4` for padding) to style elements.
* **Why we use it:**

  * **Speed:** Rapidly apply consistent design matching brand colors (#006744, #789b4a, #5bbbb7, black, white) without writing custom CSS.
  * **Maintainability:** Easily update styles across the app.

---

## 4. Email & Notifications (SendGrid + Slack Webhooks)

* **What they are:**

  * **SendGrid:** Service for sending emails (verification codes, reminders).
  * **Slack Webhooks:** Post announcements to a Slack channel.
* **Why we use them:**

  * **Reliability:** Professionally managed email deliverability.
  * **Ease of Setup:** Simple HTTP calls to trigger messages.

---

## 5. Scheduling Integration (Calendly Embed)

* **What it is:** A pre-built scheduling widget you can embed on your site.
* **Why we use it:**

  * **No Calendar Build:** Provides instant booking functionality.
  * **User-Friendly:** Familiar experience for students and owners.

---

## 6. Hosting & Deployment (Vercel)

* **What it is:** A platform for hosting Next.js apps with automatic builds and global CDN.
* **Why we use it:**

  * **Zero DevOps:** No server management—automatic scaling and HTTPS.
  * **Git Integration:** Deploys directly from GitHub pushes.

---

## 7. Analytics & Charts (Recharts)

* **What it is:** A JavaScript library for rendering charts (bar, line, pie).
* **Why we use it:**

  * **Visual Insights:** Interactive dashboards showing usage trends.
  * **Minimal Code:** Create charts with simple components.

---

## 8. Version Control & Collaboration (GitHub)

* **What it is:** A code hosting platform with built-in version control.
* **Why we use it:**

  * **Teamwork:** Track changes, review code, and manage issues.
  * **CI/CD:** Connects to Vercel for automatic deployments.

---

> *This stack prioritizes speed, reliability, and ease of maintenance—so you can focus on connecting Babson students with real-world projects, not on infrastructure headaches.*
