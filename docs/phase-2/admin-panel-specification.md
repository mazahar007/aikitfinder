# Phase 2 Step 1 — Central Admin Panel Specification

15 Nov 2026. A specification. No admin panel, role or admin route exists today.

## 1. Shape

One panel at `/admin` for the whole platform: AIKitFinder, the AI Tools Directory, AutoFlow AI and
shared services. It is a fourth route group in the existing Next.js app,
`src/app/(admin)/admin/…`, with its own layout and identity, so it shares the account, session
and UI primitives without sharing any page code with the products.

| Rule                       | Detail                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| Who can open it            | Signed-in accounts that hold a staff role. Everyone else gets a plain "not found"            |
| Where authority lives      | The Python API. The panel is a client of `/api/v1/admin/*`; it holds no database credentials |
| What the frontend check is | A convenience for navigation. Every action is re-checked by the API and the database         |
| Registration               | None. Roles are granted by a Super Admin only                                                |
| Indexing                   | `noindex`; absent from the sitemap; not linked from public pages                             |
| Audit                      | Every change and every view of private user content is recorded                              |

## 2. Navigation and permissions

| #   | Section                   | Super Admin | Admin              | Editor        | Support               | Finance                 |
| --- | ------------------------- | ----------- | ------------------ | ------------- | --------------------- | ----------------------- |
| 1   | Overview                  | Full        | Full               | Content cards | User and job cards    | Revenue and usage cards |
| 2   | Users                     | Full        | Manage             | —             | View, suspend request | View                    |
| 3   | AI Tools Directory        | Full        | Full               | Full          | View                  | —                       |
| 4   | Categories                | Full        | Full               | Full          | —                     | —                       |
| 5   | Guides and Content        | Full        | Full               | Full          | —                     | —                       |
| 6   | AutoFlow Projects         | Full        | Status             | —             | Status                | —                       |
| 7   | Generation Jobs           | Full        | Full               | —             | View                  | View cost               |
| 8   | AI Providers              | Full        | Enable, limits     | —             | —                     | View cost               |
| 9   | Usage and Credits         | Full        | View, adjust       | —             | View                  | Full                    |
| 10  | Subscriptions and Billing | Full        | View               | —             | View                  | Full                    |
| 11  | Email Management          | Full        | Full               | Templates     | View events           | —                       |
| 12  | Notifications             | Full        | Full               | —             | Send to a user        | —                       |
| 13  | System Settings           | Full        | Flags, maintenance | —             | —                     | —                       |
| 14  | Roles and Permissions     | Full        | View               | —             | —                     | —                       |
| 15  | Audit Logs                | Full        | View               | —             | —                     | View billing entries    |

"Status" means job and project state, counts and error codes, never the user's script, audio or
video. The exact permission keys are in `admin-rbac-security.md`.

## 3. Sections

### A. Overview

Cards: total users, active users (7 and 30 days), new registrations, Directory tools, published
tools, AutoFlow projects, generation jobs, failed jobs, API usage, credit consumption, revenue.

| Card                                  | Source                                    | Available when                                          |
| ------------------------------------- | ----------------------------------------- | ------------------------------------------------------- |
| Users, registrations                  | Supabase Auth (through the API)           | With the admin API                                      |
| Active users                          | Session and activity records              | Needs an activity record                                |
| Tools, published tools                | Catalog tables                            | With catalog admin                                      |
| Projects                              | `autoflow_projects`                       | With the admin API                                      |
| Jobs, failed jobs, API usage, credits | `jobs`, `provider_usage`, `credit_ledger` | With the job system                                     |
| Revenue                               | `payments`                                | Only after a payment provider exists; hidden until then |

Cards for data that does not exist yet are not shown with zeros or placeholders.

### B. Users

List with search (email, id), filters (status, role, product use, sign-up date), detail page with
account status, both workspaces, role, usage summary, recent jobs (status only) and audit trail.
Actions: suspend, reactivate, assign role (Super Admin only), send password reset, add a note.
Private content is not shown.

### C. Directory

Tools: create, edit, archive; categories and subcategories; pricing plans with source and date;
features; featured order; status (draft, in review, published, needs update, archived, already
in the schema); official sources; last verified date and verifier. Publishing as verified
requires a source and a date. Preview before publishing.

### D. AutoFlow

Project overview (counts, stage distribution), job monitor with filters by type, status,
provider and age; failed-job inspector with error code, attempts and timings; render status;
retry and cancel; provider usage; credit overview per workspace.

### E. AI providers

Provider list by capability; enable and disable; set or rotate a key (write-only field; the panel
shows only the last four characters and the rotation date); health check; usage and cost; rate
limits and daily caps.

### F. Subscriptions and billing

Plans, a workspace's plan, credit balances, the usage ledger, manual credit adjustments with a
required reason, payment records and refund status. Built only after a payment provider is
chosen; until then the section shows credits and the ledger only.

### G. Content

Guides, prompts, workflows, categories; draft, review and publish; moderation queue for
user-reported errors.

### H. Email

Template list with preview; SMTP status (configured or not, sender, last successful send); event
log (sent, delivered, bounced) where the provider reports it. The SMTP password is never shown.
Today SMTP is not configured and Supabase blocks template edits until it is.

### I. System settings

General settings, product availability, maintenance mode, provider availability, feature flags,
system logs (links to the hosting provider's logs).

### J. Security and audit

Admin activity, role changes, permission changes, sensitive configuration changes, sign-in events
for staff accounts, failed permission checks. Filter by actor, action, target and date; export.

## 4. Design

| Element         | Specification                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity        | Its own: neutral slate surfaces with one amber accent, so it is never mistaken for a product. Light and dark themes, saved separately (`theme-admin`) |
| Type            | Inter for interface text, JetBrains Mono for identifiers and numbers (both already loaded)                                                            |
| Layout          | Fixed sidebar (collapsible), top bar with global search, environment label, theme, account                                                            |
| Global search   | Users, tools, projects and jobs by id, name or email; keyboard shortcut                                                                               |
| Analytics cards | Value, period, change; each links to the filtered list behind it                                                                                      |
| Data tables     | Sticky header, sortable columns, column chooser, server-side pagination, saved filters, bulk actions where safe                                       |
| Filters         | In the URL, so a view can be shared                                                                                                                   |
| Detail pages    | Summary header, tabs, activity timeline, actions grouped by risk                                                                                      |
| Confirmation    | Destructive or costly actions ask for confirmation and, for the riskiest, the target's name typed in                                                  |
| States          | Loading skeletons; empty states that say what would appear and how to add it; errors with a request id                                                |
| Responsive      | Sidebar becomes a drawer under 1024 px; tables become stacked rows under 768 px; all controls 44 px on touch                                          |
| Accessibility   | Keyboard reachable, visible focus, labels on every control, color never the only signal                                                               |

A screen-level design (overview, one list, one detail page) should be approved before the panel
is built.

## 5. Build order

1. RBAC tables, bootstrap, audit log, admin API skeleton.
2. Shell: layout, navigation, access check, Overview with the cards that have data.
3. Users (read), Roles and Permissions, Audit Logs.
4. Directory and content management.
5. Jobs and AutoFlow monitoring, as the job system lands.
6. Providers, usage and credits.
7. Email, notifications, settings.
8. Billing, when a payment provider exists.
