# AIKitFinder

## Master Product Brief & Step-by-Step Development Instructions for Claude

**Document purpose:** This is the single source of truth for planning,
designing, and developing AIKitFinder. Give this file to Claude and ask
Claude to follow it as the project brief. Claude must
work incrementally, inspect the existing project before making changes,
and never attempt to build the entire platform in one uncontrolled step.

**Working product/brand name:** AIKitFinder\
**Preferred domain:** aikitfinder.com (the owner reports that it appears available; do not assume it has been purchased, registered, or connected until the owner confirms)\
**Internal product description:** AI tools directory and knowledge hub evolving into a SaaS platform\
**Product language:** English\
**Initial business model:** Free knowledge platform; monetization may be
introduced later\
**Development approach:** Build in small, verifiable phases with Claude\
**Initial priority:** Website foundation, design, development,
searchable directory, structured knowledge pages, and repeatable data
import\
**Long-term direction:** AI learning and productivity platform with
optional AI assistance, workflow tools, integrations, subscriptions, and
business services

------------------------------------------------------------------------

# 1. Brand and SaaS Direction

## Brand decision

Use **AIKitFinder** as the working public-facing brand throughout the
product, UI copy, page titles, metadata, and documentation unless the
owner explicitly changes the name.

- Preferred domain: `aikitfinder.com`.
- The owner has reported finding this domain available. Do not claim it
  is registered, purchased, configured, or live unless the owner confirms
  that status.
- Before launch, the owner should verify domain registration, renewal
  pricing, trademark conflicts, and relevant social handles.
- Do not silently substitute a different brand or domain.
- Use a consistent spelling: `AIKitFinder` in brand copy and
  `aikitfinder.com` in URLs.

## Positioning

AIKitFinder starts as a searchable AI tools directory and practical
knowledge hub. It must be designed from the beginning so it can grow into
an AI productivity SaaS without requiring a complete rewrite.

Suggested brand promise:

**Find the right AI tools. Learn them. Put them to work.**

Suggested tagline (editable, not mandatory):

**Discover AI. Build Smarter.**

The first release must remain useful without accounts, paid plans, or AI
API usage. The future SaaS direction is an architectural requirement, not
permission to implement all future features in the MVP.

## SaaS-readiness requirements

- Separate public directory/content features from user-specific features
  and admin features.
- Keep the data model extensible for future user accounts, saved tools,
  personal collections, prompt libraries, workflow definitions, AI
  assistant sessions, API integrations, usage limits, subscriptions, and
  billing records.
- Do not build fake or non-functional SaaS controls just to imply these
  features exist. Hide future features or label them as planned until
  implemented and tested.
- Keep provider-specific integrations behind modular service/adaptor
  boundaries so providers can be added or replaced later.
- Design authorization so public users, signed-in users, and admins can
  have distinct permissions. Apply server-side authorization and database
  access policies; never rely only on hiding UI elements.
- Plan for future subscription entitlements without requiring a paid
  subscription system in the MVP. Do not add billing or paid APIs unless
  the owner approves the scope and costs.
- Keep core directory search, tool pages, guides, admin content
  management, and CSV import working without paid AI APIs.
- Document what is implemented now versus what is only planned.

------------------------------------------------------------------------

# 2. Product Vision

Build an English-language website that helps people discover AI tools
and quickly learn how to use them effectively.

The website must not be just another list of AI tool names. It should
help a user answer practical questions such as:

-   What AI tool can help me accomplish this task?
-   How does the tool work?
-   How do I get started?
-   What setup or configuration is required?
-   What do its important settings mean?
-   What inputs do I need?
-   How do I write a useful prompt?
-   What kind of result can I reasonably expect?
-   What are the tool's limitations?
-   How do I fix common errors?
-   How can I combine this tool with other tools to complete a workflow?

The primary audience includes beginners, people with limited time,
creators, freelancers, developers, small businesses, and people who want
practical instructions rather than long, confusing documentation.

The user should be able to search for a tool, task, setting, error,
prompt, or workflow and quickly find useful, clearly structured
guidance.

## Core product promise

**Discover → Learn → Configure → Create → Automate**

The platform should make it easier to discover an AI tool, learn its
workflow, configure it correctly, use it to create something, and
eventually automate suitable parts of the process.

## Product principles

1.  **Beginner-first:** Explain unfamiliar terms and avoid assuming
    expert knowledge.
2.  **Practical over generic:** Prefer steps, examples, settings
    explanations, and troubleshooting over vague descriptions.
3.  **Search-first:** Users should be able to find tools and guidance
    quickly.
4.  **Evidence-aware:** Important claims, settings, prices, and
    capabilities should have sources and verification dates.
5.  **Modular:** The website must be expandable without needing a
    complete rewrite.
6.  **Free-first:** The first public version should be free to use.
7.  **Admin-friendly:** The owner must be able to add and update data
    without editing source code.
8.  **Cost-conscious:** Avoid paid APIs and infrastructure until there
    is a clear need.
9.  **No false promises:** Do not claim that an integration, setting, or
    automation works unless it has been implemented and tested.
10. **Content quality before quantity:** A smaller set of accurate,
    useful guides is better than hundreds of shallow or unverified
    entries.

------------------------------------------------------------------------

# 3. What the Website Is --- and Is Not

## It is

-   A searchable AI tool directory.
-   A practical knowledge base.
-   A beginner-friendly learning resource.
-   A guide to tool setup, settings, prompts, and troubleshooting.
-   A library of multi-tool workflows.
-   A foundation for future AI-powered productivity features.
-   A platform that can eventually support free and paid features.

## It is not, in the first release

-   A platform that directly runs every listed AI tool.
-   A universal API gateway for all AI services.
-   A fully autonomous AI agent system.
-   A subscription product that charges users from day one.
-   A promise that every tool can be imported automatically from an API.
-   A site that publishes unverified AI-generated documentation without
    review.

Listing a tool and explaining how to use it does not automatically mean
the website can execute that tool. Direct execution requires a supported
API, appropriate permissions, secure credentials, and a tested
integration.

------------------------------------------------------------------------

# 4. Initial Technology Direction

Use the following as the preferred starting stack unless inspection of
the existing repository reveals a strong reason to adapt it.

-   **Frontend and application:** Next.js with React and TypeScript.
-   **Styling:** Tailwind CSS.
-   **UI components:** shadcn/ui where appropriate.
-   **Database:** Supabase PostgreSQL.
-   **Authentication:** Supabase Auth when accounts are introduced.
-   **File storage:** Supabase Storage when screenshots or other uploads
    are needed.
-   **Source control:** GitHub.
-   **Deployment:** A hosting provider whose current plan permits the
    intended use. Vercel is one option, but check its current terms
    before choosing a plan for commercial use.
-   **Initial search:** PostgreSQL full-text search and filters.
-   **Future search:** Semantic/vector search if it provides a clear
    benefit.
-   **Initial AI usage:** No AI API is required for the core directory,
    content pages, and basic search.

Do not assume any service's pricing, quotas, or terms remain unchanged.
Verify current terms before production deployment.

## Architecture principles

-   Keep the interface, database access, content validation, import
    logic, and future integrations separated.
-   Use reusable components and shared types.
-   Keep secrets on the server; never expose secret keys in browser
    code.
-   Use environment variables for configuration.
-   Include an `.env.example` containing variable names and placeholder
    values only. Never put real credentials in source control.
-   Use database migrations or a documented schema setup process.
-   Validate all imported and user-submitted data.
-   Design the data model so future features can be added without
    rebuilding the entire application.
-   Avoid unnecessary dependencies and overengineering.

------------------------------------------------------------------------

# 5. Initial MVP Scope

The first version should be a polished, responsive, English-language
website with a manageable number of high-quality records.

## Public pages

### 4.1 Homepage

Include:

-   Clear headline and short explanation of the platform.
-   Prominent global search field.
-   Browse-by-category section.
-   Popular or featured AI tools.
-   Beginner quick-start guides.
-   Recently updated guides or tools.
-   Popular workflows.
-   Clear links to explore tools and tutorials.
-   Footer with About, Contact, Privacy, Terms, and content/disclosure
    pages as appropriate.

Suggested headline direction:

**Find the Right AI Tool. Learn It. Use It.**

Suggested supporting text:

"Explore AI tools, understand their settings, follow practical
tutorials, and discover workflows that help you get better results."

Do not use fake statistics, fake testimonials, or invented usage counts.

### 4.2 Explore Tools

Features:

-   Search by tool name or description.
-   Filter by category.
-   Filter by intended use.
-   Filter by beginner/intermediate/advanced level where applicable.
-   Filter by free, freemium, paid, or open-source model when verified.
-   Filter by API availability when verified.
-   Sort by name, recently updated, or editorially featured.
-   Pagination or another scalable listing pattern.
-   Useful empty states when no result matches.

### 4.3 Category pages

Initial categories may include:

-   AI Video Generation
-   AI Image Generation
-   AI Audio and Voice
-   AI Video Editing
-   AI Writing and Research
-   AI Coding and Development
-   AI Design
-   AI Productivity
-   AI Automation
-   AI Marketing and SEO
-   AI Business Tools
-   AI Data and Analytics

Categories must be manageable from the admin system. Avoid hard-coding
the full category list into multiple components.

### 4.4 Tool details page

Every tool page should use a consistent structure:

1.  Tool name, logo or approved visual, and concise overview.
2.  Official website link.
3.  Main use cases.
4.  Intended audience and skill level.
5.  Key features.
6.  Pricing model, only when verified.
7.  Free plan or trial details, only when verified.
8.  API availability and integration notes, only when verified.
9.  Quick-start instructions.
10. Setup requirements.
11. Settings explained.
12. Prompt examples or templates.
13. Expected outcomes and limitations.
14. Troubleshooting.
15. Related tutorials and workflows.
16. Official documentation and other sources.
17. Last verified date.
18. Feedback/report-an-issue action.

Use clear labels such as "Verified," "Needs review," or "Last checked"
where appropriate. Never imply a setting has been tested if it has not.

### 4.5 Guide/tutorial page

A guide should support:

-   Title and summary.
-   Skill level.
-   Estimated reading or completion time.
-   Prerequisites.
-   Required tools.
-   Step-by-step instructions.
-   Images or screenshots where useful.
-   Prompt or configuration examples.
-   Expected outcome.
-   Common mistakes.
-   Troubleshooting.
-   Sources.
-   Last verified date.
-   Related guides.

### 4.6 Search results page

Search across relevant content types:

-   Tools.
-   Guides.
-   Prompts.
-   Workflows.
-   Settings explanations.
-   Troubleshooting entries.

For the MVP, implement reliable keyword/full-text search and filters
first. Do not add an expensive AI search system until there is enough
content and a demonstrated need.

### 4.7 Admin area

An owner/admin must be able to:

-   Create, edit, preview, publish, unpublish, and archive tools.
-   Create and edit categories.
-   Create and edit guides.
-   Add prompts, settings explanations, and workflows.
-   Add source URLs and verification dates.
-   Upload or attach permitted images.
-   Import records from CSV.
-   Review validation errors.
-   Detect duplicates.
-   View import history.
-   Search and filter the admin content list.

The admin interface is a core MVP requirement because content will be
added regularly. Do not require the owner to edit code for ordinary
content updates.

------------------------------------------------------------------------

# 6. Standard Content Template for Every AI Tool

Use this template when preparing tool documentation.

## A. Overview

-   Name
-   Slug
-   Official URL
-   Short description
-   Full overview
-   Main category and tags
-   Target users
-   Skill level

## B. Capabilities

-   Main use cases
-   Supported input types
-   Output types
-   Notable features
-   Known limitations
-   Unsupported or uncertain capabilities

## C. Getting Started

-   Account/setup requirements
-   Required plan, if applicable
-   First-use steps
-   A simple beginner example
-   Expected result
-   Common first-use problems

## D. Settings and Configuration

For every setting documented: - Exact setting name as shown in the
current product - Plain-English explanation - What it controls, based on
a source or test - Available range/options, if verified - When to adjust
it - Example configuration - Trade-offs - Verification status - Source
and last-checked date

Do not invent hidden settings, internal instructions, undocumented
parameters, or guaranteed outcomes. If information is unavailable, say
so.

## E. Prompt Library

Each prompt should include: - Prompt title - Intended task - Prompt
text - Required user inputs/placeholders - Recommended use - Expected
type of output - Limitations or caveats - Tested/untested status -
Compatible tool/model, if known

## F. Troubleshooting

-   User-visible problem or error
-   Possible causes
-   Diagnostic steps
-   Recommended fixes
-   When to consult official support
-   Source/reference

## G. Sources and maintenance

-   Official documentation URLs
-   Additional reliable sources where useful
-   Last verified date
-   Content status: Draft, In Review, Published, Needs Update, Archived
-   Change history

------------------------------------------------------------------------

# 7. Data Import and Content Operations

Regular data entry and import is a major requirement, not a later
afterthought.

The initial system should support manual entry and CSV import. External
APIs and automated source monitoring can be added later.

## 6.1 Manual entry

Admin forms should make it easy to create a tool or guide without
touching code.

Required fields should be clearly marked. Optional fields should not
block a draft from being saved.

## 6.2 CSV import

Build an admin import flow with the following steps:

1.  Download a sample CSV template.
2.  Upload a CSV file.
3.  Parse the file safely.
4.  Validate column names and required fields.
5.  Validate URLs and field formats.
6.  Normalize whitespace and slugs.
7.  Detect duplicate records using a stable key, preferably a unique
    slug and/or canonical official URL.
8.  Show a preview of new records, updates, skipped rows, and errors.
9.  Require admin confirmation before writing changes.
10. Save valid records as Draft by default unless the admin explicitly
    chooses another safe workflow.
11. Produce a downloadable or viewable error report.
12. Record an import log with timestamp, filename, totals, and outcome.

Do not silently overwrite existing records. Show what will change and
let the admin confirm. Make repeated imports idempotent where possible,
so the same file does not create duplicate records.

## 6.3 Suggested initial CSV columns

For tools:

-   `name`
-   `slug`
-   `official_url`
-   `short_description`
-   `overview`
-   `category_slug`
-   `use_cases`
-   `skill_level`
-   `pricing_model`
-   `free_plan_status`
-   `api_availability`
-   `documentation_url`
-   `status`
-   `last_verified_at`
-   `source_notes`

For guides:

-   `title`
-   `slug`
-   `summary`
-   `content`
-   `skill_level`
-   `estimated_minutes`
-   `related_tool_slug`
-   `status`
-   `last_verified_at`
-   `source_urls`

Adapt the final schema to support arrays and structured fields
correctly. If using CSV, document how multi-value fields are
represented, such as semicolon-separated values, and escape values
safely.

## 6.4 Future import connectors

Later, create separate connectors for permitted and reliable sources.
Before implementing a connector:

-   Check whether the source offers an official API or export.
-   Read its terms and rate limits.
-   Store source attribution.
-   Track when data was fetched.
-   Validate the fetched data.
-   Do not scrape sites in violation of their terms.
-   Do not assume that a directory's entire dataset is available for
    reuse.
-   Keep imported records in Draft/Review until checked.
-   Avoid importing copied descriptions wholesale when licensing does
    not permit it.

## 6.5 Content review

Every important, changeable claim should have a source and verification
date. Pricing, feature availability, API access, usage limits, and
licensing can change frequently.

Provide a way to mark content "Needs Update." Future automation may flag
stale records, but a flag is not proof that the information is wrong.

------------------------------------------------------------------------

# 8. Suggested Data Model

Use a relational model with clear relationships. Adjust field types and
naming to the actual implementation, but preserve the product concepts.

## Core tables

### `tools`

Suggested fields: - `id` - `name` - `slug` (unique) - `official_url` -
`logo_url` (optional) - `short_description` - `overview` -
`skill_level` - `pricing_model` - `free_plan_status` -
`api_availability` - `status` - `featured` - `last_verified_at` -
`created_at` - `updated_at`

### `categories`

-   `id`
-   `name`
-   `slug` (unique)
-   `description`
-   `parent_id` (optional for future nesting)
-   `created_at`
-   `updated_at`

### `tool_categories`

Use a join table if a tool can belong to multiple categories. Otherwise,
a single category relationship is acceptable for the MVP. Choose one
model deliberately and document it.

### `guides`

-   `id`
-   `title`
-   `slug` (unique)
-   `summary`
-   `content` or structured content field
-   `skill_level`
-   `estimated_minutes`
-   `status`
-   `last_verified_at`
-   `created_at`
-   `updated_at`

### `guide_tools`

Join table linking guides to one or more tools.

### `guide_steps`

-   `id`
-   `guide_id`
-   `step_number`
-   `title`
-   `body`
-   `image_url` (optional)
-   `created_at`
-   `updated_at`

### `tool_settings`

-   `id`
-   `tool_id`
-   `setting_name`
-   `plain_language_explanation`
-   `options_or_range`
-   `recommended_use`
-   `tradeoffs`
-   `verification_status`
-   `source_url`
-   `last_verified_at`

### `prompts`

-   `id`
-   `title`
-   `slug`
-   `description`
-   `prompt_text`
-   `skill_level`
-   `tool_id` (optional)
-   `status`
-   `tested_status`
-   `created_at`
-   `updated_at`

### `workflows`

-   `id`
-   `title`
-   `slug`
-   `summary`
-   `skill_level`
-   `status`
-   `last_verified_at`
-   `created_at`
-   `updated_at`

### `workflow_steps`

-   `id`
-   `workflow_id`
-   `step_number`
-   `title`
-   `instructions`
-   `input_description`
-   `output_description`
-   `tool_id` (optional)
-   `guide_id` (optional)

### `resources`

-   `id`
-   `title`
-   `url`
-   `source_type`
-   `related_tool_id` (optional)
-   `related_guide_id` (optional)
-   `checked_at`
-   `notes`

### `tags` and join tables

Use tags to support discovery across tools, guides, prompts, and
workflows.

### `import_jobs`

-   `id`
-   `filename`
-   `started_at`
-   `completed_at`
-   `created_count`
-   `updated_count`
-   `skipped_count`
-   `error_count`
-   `status`
-   `admin_notes`

### `content_versions` or an equivalent audit mechanism

Track important edits and status changes. A full versioning system can
be phased in, but at minimum record timestamps and import logs.

### Future tables, not required for MVP

-   `profiles`
-   `bookmarks`
-   `feedback`
-   `subscriptions`
-   `usage_events`
-   `teams`
-   `team_members`
-   `ai_conversations`
-   `workflow_runs`
-   `integrations`

Do not build every future table or feature now. Keep future expansion in
mind without overengineering.

------------------------------------------------------------------------

# 9. Search and Discovery Requirements

## MVP search

Implement: - Search by tool name. - Search by short description and
overview. - Search guide titles and summaries. - Category and
skill-level filters. - Pricing/API filters only when data is available
and reliable. - Useful result cards with a clear description. - Empty
state with suggestions to broaden the query. - Accessible keyboard and
mobile behavior.

Use PostgreSQL full-text search or another lightweight, reliable search
solution compatible with the chosen stack.

## Later search improvements

-   Typo tolerance.
-   Synonyms and task-based search.
-   Semantic/vector search.
-   Search across settings, prompts, workflows, and troubleshooting.
-   Search analytics to identify missing content.

Do not add an external search provider until the MVP needs it and its
cost/terms have been evaluated.

------------------------------------------------------------------------

# Audience, User Psychology, and Experience Principles

## Target audience
The initial target audience is **ages 14–45**, with an international, English-speaking audience. This includes teenagers, students, early-career professionals, creators, freelancers, developers, and business users. Do not assume everyone in this age range has the same preferences or technical ability. Design for different experience levels and accessibility rather than relying on age stereotypes.

## Audience needs
- Find useful answers quickly, often while doing another task.
- Understand technical concepts without feeling overwhelmed.
- See clear next steps rather than long, unstructured text.
- Compare tools fairly and understand limitations.
- Copy prompts, follow guides, or save workflows with minimal friction.
- Trust information because sources, verification dates, and uncertainty are visible.
- Use the website comfortably on mobile, tablet, and desktop.

## User-experience principles
1. **Fast to understand:** A first-time visitor should understand the website's purpose within seconds.
2. **Low cognitive load:** Use clear labels, short summaries, consistent page patterns, scannable sections, and progressive disclosure.
3. **User control:** Avoid intrusive popups, autoplay, unnecessary animation, and manipulative dark patterns.
4. **Trust and clarity:** Distinguish verified facts, editorial recommendations, community feedback, and sponsored/affiliate content.
5. **Inclusive and accessible:** Use readable typography, adequate contrast, keyboard navigation, visible focus states, meaningful labels, and reduced-motion support.
6. **Mobile-first responsiveness:** Search, filters, cards, and guides must work smoothly on small screens.
7. **Progressive learning:** Show a quick answer first, then step-by-step instructions, then advanced details.
8. **Performance:** Optimize images, avoid unnecessary client-side JavaScript, and prevent layout shifts.
9. **No age stereotypes:** Personalize by task, skill level, and user-selected preferences, not by assumptions about age.
10. **Privacy-aware:** Collect only necessary data and explain future account/AI data handling clearly.

## Color and visual psychology
Choose colors to support clarity, trust, discovery, and comfortable reading—not because a color is assumed to appeal to every person in an age group. Treat the palette as a starting hypothesis and validate it with users and accessibility checks.

Recommended starting direction:
- **Primary/structure:** Deep navy or blue for a dependable, clear interface.
- **Action accent:** Accessible blue or teal for primary actions and interactive states.
- **Background:** Soft neutral background in light mode.
- **Cards/surfaces:** White or near-white with subtle borders.
- **Text:** High-contrast dark neutral text in light mode.
- **Success:** Accessible green.
- **Warning/review:** Accessible amber.
- **Error/destructive action:** Accessible red.

Start with a **light theme by default**, suitable for reading documentation for extended periods. A dark theme can be added later if user feedback supports it. Store colors as design tokens/CSS variables instead of scattering hex codes through components. Do not use color alone to convey status; include labels or icons. Check text contrast, focus states, hover states, and color-blind readability using WCAG guidance.

## Navigation and information architecture
- **Top navigation:** Logo, Explore Tools, Guides, Workflows, About, and Search.
- **Homepage:** Clear value proposition, prominent search, categories, featured tools, beginner quick starts, recently updated guides, and popular workflows.
- **Explore Tools:** Searchable cards with useful filters and sorting.
- **Tool pages:** Overview, Quick Start, Features, Settings, Prompts, Troubleshooting, Sources, and related guides.
- **Guide pages:** Summary, skill level, estimated time, prerequisites, numbered steps, expected outcome, troubleshooting, and sources.
- Use breadcrumbs on deeper pages.
- Keep common actions visible and advanced details in clearly labelled sections.
- Show active filters and make them easy to clear.
- Keep navigation patterns consistent so users do not have to relearn the interface on each page.
- Footer: About, Contact, Privacy, Terms, editorial policy, and disclosures as applicable.

## Smooth interaction requirements
- Consistent spacing, typography, buttons, cards, badges, forms, and navigation.
- Clear hover, focus, active, loading, success, empty, and error states.
- Descriptive button labels and easy-to-use search filters.
- Responsive layouts without horizontal overflow.
- Keyboard support and semantic HTML for assistive technologies.
- Respect `prefers-reduced-motion`; use subtle transitions only when helpful.
- Avoid animations that delay access to information.
- Test the main flows on mobile and desktop before launch.

## Design validation
Before finalizing the visual system:
1. Create a prototype or two lightweight visual directions.
2. Test with a small mix of intended users, including beginners and experienced users, if possible.
3. Check whether users can find a tool, understand a guide, and locate the next step without help.
4. Check accessibility and contrast.
5. Record feedback and revise the design.
Do not claim the design is validated until it has actually been tested.


# 10. Design Direction

Create a modern, clean, professional knowledge platform. The site should
feel like a trustworthy technical knowledge base combined with a modern
SaaS directory.

## Design requirements

-   English-only interface for launch.
-   Responsive layout for mobile, tablet, and desktop.
-   Strong visual hierarchy.
-   Prominent search.
-   Readable typography and generous spacing.
-   Clear cards and category navigation.
-   Consistent badges for skill level and content status.
-   Good loading, empty, and error states.
-   Accessible contrast and keyboard navigation.
-   Avoid clutter, unnecessary animation, and decorative elements that
    reduce usability.
-   Use a consistent design system for buttons, forms, cards, badges,
    navigation, and content layouts.

Choose a coherent light or dark visual system; do not mix unrelated
styles. Prefer a clean, professional interface over an overly futuristic
"AI neon" appearance.

Before implementation, define: - Color tokens. - Typography scale. -
Spacing scale. - Border and radius conventions. - Component variants. -
Responsive breakpoints.

Use genuine tool logos only when permitted and available. Do not
fabricate logos or imply endorsement by the tool vendor.

------------------------------------------------------------------------

# 11. Future AI Features --- Plan for Them, Do Not Build All Now

The MVP should work without paid AI APIs. Keep the architecture ready
for future additions.

## Phase 2 candidates

-   AI guide assistant grounded in the website's verified content.
-   Natural-language search.
-   Personalized learning paths.
-   Bookmarks and user accounts.
-   Prompt generator.
-   Tool recommendation assistant.
-   Feedback and issue reporting.

## Phase 3 candidates

-   Workflow builder.
-   Prompt testing and version comparison.
-   Settings advisor.
-   AI-assisted draft documentation.
-   Team workspaces.
-   Subscription and billing.

## Phase 4 candidates

-   Direct API integrations.
-   Workflow execution.
-   Multi-tool orchestration.
-   AI agents with explicit permissions.
-   Workflow marketplace.
-   Premium courses.
-   B2B knowledge bases and setup services.

### Requirements for future AI assistant

-   Prefer answers grounded in the platform's own reviewed content.
-   Cite or link to the relevant guide and source.
-   Clearly distinguish verified facts from general suggestions.
-   Admit when the knowledge base does not contain the answer.
-   Do not invent tool settings, API parameters, prices, or features.
-   Rate-limit usage and track cost.
-   Protect private user data and secrets.
-   Do not send secrets or API keys to the model unnecessarily.

------------------------------------------------------------------------

# 12. Monetization Direction

The initial website must be free. Do not implement payment collection in
the MVP.

Potential future revenue models: - Freemium subscription. - Pro guides
and templates. - Creator-focused workflow tools. - Affiliate links with
clear disclosure. - Sponsored listings clearly labelled as sponsored. -
Premium courses. - Workflow/template marketplace. - Paid AI integration
and automation services. - Team and business subscriptions.

Possible test pricing for later validation (not final pricing): - Free:
public directory and basic guides. - Pro: around \$9/month. - Creator:
around \$19/month. - Professional: around \$39/month. - Team: custom or
starting price after validating demand.

These are hypotheses, not validated market prices. Do not build the
product around these prices until user research and cost modelling
support them.

Subscription features should save time or enable repeat use. A large
list of public information alone may not be enough to justify recurring
payment.

Before introducing paid plans, evaluate: - User retention. - Paid
conversion. - Churn. - AI cost per active user. - Payment fees. -
Support cost. - Customer acquisition cost. - Terms for any APIs and
hosting services used.

------------------------------------------------------------------------

# 13. Security, Privacy, and Reliability

Required from the beginning:

-   Keep service-role keys and secrets server-side.
-   Never commit `.env` files containing real credentials.
-   Include `.env.example` with placeholders.
-   Use Supabase Row Level Security where appropriate.
-   Protect admin routes and admin actions.
-   Validate uploaded files and CSV data.
-   Limit file size and acceptable file types.
-   Sanitize rendered user/admin content to avoid script injection.
-   Use safe link handling for external URLs.
-   Apply rate limits to future public APIs and AI endpoints.
-   Provide a basic privacy policy and terms before public launch where
    appropriate.
-   Do not store sensitive data unnecessarily.
-   Maintain backups or exports of important content.
-   Do not allow a CSV import to silently destroy or overwrite records.
-   Add clear error messages without exposing credentials or stack
    traces to visitors.

For the MVP, the site can be public without user accounts. Admin-only
content management must still be protected.

------------------------------------------------------------------------

# 14. SEO and Content Strategy

Use English content for an international audience.

Important principles: - Each tool and guide should have a useful, unique
page. - Use readable, stable URLs/slugs. - Include page titles and meta
descriptions. - Use canonical URLs where appropriate. - Generate a
sitemap. - Configure robots directives correctly. - Add structured data
only when valid and appropriate. - Ensure pages load quickly and work on
mobile. - Link related tools, settings, guides, and workflows. - Do not
mass-publish low-value AI-generated pages. - Add sources and
verification dates to factual guides. - Clearly disclose affiliate and
sponsored content.

Suggested URL structure: - `/tools/` - `/tools/[tool-slug]/` -
`/categories/[category-slug]/` - `/guides/` - `/guides/[guide-slug]/` -
`/prompts/` - `/workflows/` - `/workflows/[workflow-slug]/` -
`/search/?q=...`

Keep the URL structure stable once content is indexed.

------------------------------------------------------------------------

# 15. Development Roadmap and Acceptance Criteria

Claude must follow these phases in order. Do not skip ahead without
confirming that the current phase works.

## Phase 0 --- Inspect and Plan

Tasks: 1. Inspect the existing repository and files. 2. Determine
whether the project is new or already partially built. 3. Check the
installed Node.js/package manager versions and existing dependencies. 4.
Summarize the current state. 5. Identify any missing credentials or
decisions. 6. Propose the exact implementation plan. 7. Do not delete or
overwrite existing work without explaining why and obtaining approval
when appropriate.

Deliverables: - Repository assessment. - Proposed file structure. -
Environment variable list. - Database plan. - Phase-by-phase task
checklist.

Acceptance criteria: - No unnecessary changes made before inspection. -
The next step is clear and appropriately small.

## Phase 1 --- Project Foundation

Tasks: 1. Set up or validate Next.js, React, and TypeScript. 2.
Configure Tailwind and the selected component library. 3. Set up linting
and formatting where appropriate. 4. Create shared layout, navigation,
footer, and design tokens. 5. Add responsive behavior. 6. Add
`.env.example`. 7. Document local setup and run commands.

Acceptance criteria: - Project starts locally using documented
commands. - No TypeScript or build errors. - Responsive shell works on
mobile and desktop. - No secrets committed.

## Phase 2 --- Static UI Prototype

Build the homepage, tool directory, category page, tool detail page,
guide page, and search results using clearly labelled sample data.

Acceptance criteria: - Navigation works. - Search and filters work
against sample data. - Pages share reusable components. - UI has
loading/empty/error states where relevant. - No fabricated real-world
statistics. - The owner can review the visual direction before backend
complexity is added.

## Phase 3 --- Database and Content Models

Tasks: 1. Configure Supabase using environment variables. 2. Create SQL
migrations or a documented schema. 3. Implement typed data access. 4.
Add seed data for a small number of clearly labelled sample tools. 5.
Add indexes for search and common filters. 6. Configure permissions and
RLS as needed.

Acceptance criteria: - Data can be read from the database. - Schema
setup is reproducible. - Public visitors cannot perform admin-only
changes. - Seed data can be distinguished from verified production
content.

## Phase 4 --- Admin CMS

Tasks: 1. Protect admin routes. 2. Build tool and category management.
3. Build guide management. 4. Add
draft/review/published/needs-update/archived states. 5. Add source URLs
and verification dates. 6. Add preview before publishing.

Acceptance criteria: - Admin can create, edit, preview, publish, and
unpublish content without editing source code. - Unauthorized visitors
cannot access protected actions. - Validation errors are understandable.

## Phase 5 --- CSV Import

Tasks: 1. Provide downloadable templates. 2. Parse and validate CSV
files. 3. Show a preview before importing. 4. Detect duplicates and
possible updates. 5. Require confirmation before changes are written. 6.
Save imports as Draft by default. 7. Show a row-level error report. 8.
Store import logs.

Acceptance criteria: - Valid CSV imports work. - Invalid rows are
reported clearly. - Duplicate imports do not create duplicate records. -
Existing records are not silently overwritten. - Import behavior is
documented with an example CSV.

## Phase 6 --- Search and Content Quality

Tasks: 1. Add database-backed full-text search. 2. Add filters and
sorting. 3. Add related content. 4. Add source and last-verified
displays. 5. Add feedback or "report outdated information" workflow. 6.
Add SEO metadata and sitemap.

Acceptance criteria: - Search works across tools and guides. - Filters
can be combined. - Results are useful and have clear links. - Important
pages have metadata and canonical URL handling.

## Phase 7 --- Initial Content and Public Launch

Tasks: 1. Add a curated initial set of approximately 30--50 tools if
time permits. 2. Prioritize high-quality tool pages and useful beginner
guides. 3. Verify official URLs and changeable claims. 4. Test mobile
layouts, accessibility basics, forms, search, and admin security. 5.
Configure domain and production deployment. 6. Document backup/export
procedures. 7. Publish privacy, terms, and contact information as
appropriate.

Acceptance criteria: - No broken primary navigation. - No visible sample
placeholders presented as real content. - Admin workflows work in
production. - Important records have sources and verification dates. -
The website can be updated without code edits for ordinary content
changes.

## Phase 8 --- Post-launch Improvements

Only after the MVP is stable: - Analytics. - Bookmarks and accounts. -
Advanced search. - AI assistant. - Prompt generator. - Workflow
builder. - Subscription and billing. - API integrations and automation.

Do not implement these merely because they are listed here. Prioritize
using actual user feedback, usage data, cost, and feasibility.

------------------------------------------------------------------------

# 16. How Claude Must Work With the Owner

Claude should act as a senior product-minded full-stack developer and
patient technical guide.

The owner wants to build step by step and may use Claude to perform the
development. Claude must therefore explain decisions in practical
language without being unnecessarily verbose.

## Mandatory collaboration rules

1.  **Work in small milestones.** Do not generate the entire application
    in one huge response.
2.  **Inspect first.** If a repository exists, inspect it before
    changing files.
3.  **Explain before major changes.** Briefly explain what will change
    and why.
4.  **Keep the owner informed.** After each milestone, list files
    created/changed, features completed, commands to run, and how to
    test.
5.  **Provide exact commands.** When a terminal action is needed, give
    the exact command and explain where to run it.
6.  **Do not pretend to run commands.** If Claude cannot execute the
    command, say so and ask the owner to run it and share the output.
7.  **Wait for test results at key checkpoints.** Do not continue past a
    blocking error.
8.  **Prefer complete, coherent files.** Avoid giving disconnected
    snippets when a full file change is needed.
9.  **Preserve existing work.** Do not delete or replace files without
    inspecting their purpose.
10. **Use current official documentation** for framework APIs,
    deployment limits, pricing, and terms when browsing is available.
11. **Do not hard-code secrets.** Explain environment variables and safe
    credential handling.
12. **Use realistic data.** Clearly label demo/sample data; do not
    fabricate real tool pricing, capabilities, user counts, or
    testimonials.
13. **Make accessibility and responsive behavior part of the work**, not
    a final cosmetic step.
14. **Test after meaningful changes.** Use available lint, type-check,
    unit, integration, and build checks as appropriate.
15. **Do not silently expand scope.** Suggest optional features
    separately and ask before introducing substantial new dependencies
    or paid services.
16. **Maintain a project checklist** and update it after each completed
    milestone.
17. **Keep documentation updated**, including setup instructions,
    schema/migrations, import format, deployment, and known limitations.
18. **Avoid premature AI integration.** The core directory, guides,
    admin CMS, and CSV import must work without paid AI APIs.
19. **Do not treat this brief as permission to purchase services or
    create accounts.** The owner will perform any required purchases and
    account authorizations.
20. **Ask only necessary questions.** Use sensible defaults for
    reversible decisions; ask before irreversible actions, paid
    commitments, or major product choices.

## Required response format after each milestone

Claude should report:

-   **Completed**
-   **Files changed**
-   **How to run/test**
-   **Test results or tests still needed**
-   **Known issues**
-   **Next milestone**
-   **Any decision needed from the owner**

------------------------------------------------------------------------

# 17. First Prompt to Give Claude

After sharing this document with Claude and opening the project
folder/repository, send the following instruction:

> Read the complete `AI_TOOLS_KNOWLEDGE_HUB_MASTER_BRIEF_v2.md` before
> taking action. Treat it as the product source of truth. The public-facing
> brand is AIKitFinder and the preferred domain is `aikitfinder.com`; do not
> assume the domain has been purchased or configured.
>
> We are building the project step by step. Do not build everything at
> once.
>
> Start with **Phase 0 --- Inspect and Plan** only. Inspect the existing
> project and report its current state, stack, files, dependencies, and
> any risks. If this is a new project, recommend the smallest practical
> setup based on this brief.
>
> Then propose a short, ordered implementation checklist for Phase 1. Do
> not make destructive changes, add paid services, add an AI API, or
> start later phases without explaining the need and getting approval
> where appropriate.
>
> Use the preferred stack in the brief unless there is a concrete
> technical reason not to. Explain that reason before changing the plan.
>
> When Phase 1 begins, implement it in small, testable changes. After
> each milestone, tell me exactly what changed, which commands I need to
> run, how I can verify it, and what we should do next.
>
> Keep the application English-only for the initial release. The first
> release is a free AIKitFinder platform with a searchable AI tools
> directory, tool and guide pages, an admin CMS, and reliable CSV import. Future AI
> and subscription features are planned but are not part of the first
> implementation phase.
>
> Never claim a test passed unless it was actually run and its result
> was observed. If you need me to run a command, provide the exact
> command and wait for the output when it is necessary to proceed.

------------------------------------------------------------------------

# 18. Project Checklist

Use this as the ongoing checklist. Update it as work progresses.

## Planning

-   [ ] Product brief reviewed
-   [ ] Existing repository inspected
-   [x] Working brand selected: AIKitFinder; preferred domain: aikitfinder.com (registration status to be confirmed)
-   [ ] Hosting and commercial-use terms checked
-   [ ] Initial sitemap approved
-   [ ] Design direction approved

## Foundation

-   [ ] Project setup documented
-   [ ] Shared layout and design tokens created
-   [ ] Responsive shell completed
-   [ ] Environment variable template created
-   [ ] Lint/type-check/build commands documented

## Core website

-   [ ] Homepage
-   [ ] Tool directory
-   [ ] Category pages
-   [ ] Tool detail page
-   [ ] Guide page
-   [ ] Search results
-   [ ] Related content

## Backend and admin

-   [ ] Database schema/migrations
-   [ ] Seed/demo data
-   [ ] Admin protection
-   [ ] Tool CRUD
-   [ ] Category CRUD
-   [ ] Guide CRUD
-   [ ] Publishing workflow
-   [ ] Source and verification fields

## Import and search

-   [ ] CSV templates
-   [ ] CSV preview and validation
-   [ ] Duplicate detection
-   [ ] Import confirmation
-   [ ] Row-level error report
-   [ ] Import logs
-   [ ] Full-text search
-   [ ] Filters and sorting

## Launch readiness

-   [ ] Initial content reviewed
-   [ ] Official sources verified
-   [ ] Mobile testing
-   [ ] Accessibility basics checked
-   [ ] Security review
-   [ ] Backup/export tested
-   [ ] SEO metadata and sitemap
-   [ ] Domain and production deployment
-   [ ] Privacy/terms/contact pages
-   [ ] No demo placeholders presented as verified content

## Future phases

-   [ ] Analytics
-   [ ] User accounts/bookmarks
-   [ ] AI Guide Assistant
-   [ ] Prompt Generator
-   [ ] Workflow Builder
-   [ ] Subscription and billing
-   [ ] API integrations
-   [ ] Team/B2B features

------------------------------------------------------------------------

# 19. Final Instruction

The most important goal is to launch a reliable, useful, free-first
knowledge website and build it in manageable stages.

Do not chase feature count. Prioritize: 1. A clear and polished user
experience. 2. Reliable search. 3. Useful, verified tool information. 4.
Beginner-friendly setup guides. 5. An admin workflow that makes regular
data imports easy. 6. Secure, maintainable foundations. 7. Future
extensibility without premature complexity.

Every new feature should be evaluated against three questions:

-   Does it solve a real user problem?
-   Can it be maintained accurately and securely?
-   Is it worth the development and operating cost at this stage?

Build the foundation first. Validate the product with real users. Add
AI, subscriptions, and automation only when they create demonstrable
value.
