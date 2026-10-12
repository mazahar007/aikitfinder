# AIKitFinder

**Find the right AI tools. Learn them. Put them to work.**

AIKitFinder is a free, English-language AI tools directory and practical knowledge hub. It is being
built step by step following [`docs/MASTER_BRIEF.md`](docs/MASTER_BRIEF.md), the product's source of
truth. Progress is tracked in [`docs/PROJECT_CHECKLIST.md`](docs/PROJECT_CHECKLIST.md) and the visual
rules live in [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

> Status: **Phase 2 (UI prototype) complete.** All public pages work against clearly labelled,
> fictional sample data. There is no database, no accounts and no paid service yet.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Cache Components) + React 19 + TypeScript
- Tailwind CSS v4 with design tokens as CSS variables (`src/app/globals.css`)
- shadcn/ui-style components (Radix primitives + `class-variance-authority`) in `src/components/ui`
- Inter and JetBrains Mono via `next/font` (self-hosted at build time)
- pnpm

Supabase (database, auth, storage) arrives in Phase 3.

## Requirements

- Node.js 20.9 or newer (developed on 22)
- pnpm 10 (`corepack enable` installs the version pinned in `package.json`)

## Getting started

Run these in a terminal from the project folder:

```bash
pnpm install                 # install dependencies
cp .env.example .env.local   # create your local settings file
pnpm dev                     # start the dev server at http://localhost:3000
```

## Scripts

| Command             | What it does                                    |
| ------------------- | ----------------------------------------------- |
| `pnpm dev`          | Development server with hot reload              |
| `pnpm build`        | Production build (fails on type errors)         |
| `pnpm start`        | Serve the production build                      |
| `pnpm lint`         | ESLint (Next.js core-web-vitals + TypeScript)   |
| `pnpm typecheck`    | Generate route types and run `tsc --noEmit`     |
| `pnpm format`       | Format all files with Prettier                  |
| `pnpm format:check` | Check formatting without changing files         |
| `pnpm check`        | Lint, typecheck and format check in one command |

Run `pnpm check && pnpm build` before every commit.

## Environment variables

See [`.env.example`](.env.example). Copy it to `.env.local` (git-ignored) and never commit real keys.
Today the app uses `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_SITE_INDEXABLE`. The Supabase and admin
variables are listed for later phases. Anything prefixed `NEXT_PUBLIC_` is visible in the browser; `SUPABASE_SERVICE_ROLE_KEY` must
stay server-only.

## Deploying a preview (Vercel or Netlify)

Both platforms build this project with no extra configuration:

1. Sign in to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) with GitHub.
2. Import the `aikitfinder` repository. The framework is detected as Next.js and pnpm is detected
   from `pnpm-lock.yaml`.
3. Leave `NEXT_PUBLIC_SITE_INDEXABLE` unset (or `false`) so the temporary `*.vercel.app` /
   `*.netlify.app` address stays out of Google. The site URL is detected automatically.
4. Deploy. Every push to a branch gets its own preview link.

When the real domain is ready, add it in the hosting dashboard, then set
`NEXT_PUBLIC_SITE_URL=https://aikitfinder.com` and `NEXT_PUBLIC_SITE_INDEXABLE=true` and redeploy.
Check each platform's current plan terms before any commercial use.

## Project structure

```
src/
  app/                 Routes (one folder per URL), root layout, global CSS tokens
  components/
    content/           Cards, badges, prompt block, sources, empty state, pagination
    layout/            Header, footer, navigation, breadcrumbs, container, page placeholder
    search/            Search form (header, hero and page variants)
    theme/             Light/dark theme toggle and the no-flash inline script
    tools/             Tool directory filters, sort and active-filter chips
    ui/                Reusable primitives: Button, Badge, Input, Sheet
  config/site.ts       Site name, description and navigation links
  lib/content/         Content types, data access (repository), search and tool filtering
    sample/            Fictional sample data used until the database arrives in Phase 3
  lib/utils.ts         Shared helpers (cn)
docs/                  Master brief, design system, project checklist
```

## Content and data

Pages never import sample data directly. They call the async functions in
`src/lib/content/repository.ts` (`getTools`, `getTool`, `getGuides`, …). In Phase 3 those functions
switch to Supabase with the same signatures, so the pages do not change. The types in
`src/lib/content/types.ts` mirror the planned database tables. A tool can belong to several
categories; the first one is its primary category.

## Accessibility baseline

- A skip link is the first focusable element on every page
- Visible focus ring on every interactive element
- Touch targets are at least 44px tall
- Press `/` anywhere to focus the search field
- Animations are disabled when the device asks for reduced motion
- Every text colour pairing meets WCAG 2.2 AA (see the design system)

## Notes for contributors

- `AGENTS.md` is generated by Next.js and tells AI coding agents to read the bundled Next.js 16 docs
  in `node_modules/next/dist/docs/` before writing code. Keep it committed.
- Use design tokens (`bg-primary`, `text-muted-foreground`, `border-border`, …), never raw hex codes,
  in components.
