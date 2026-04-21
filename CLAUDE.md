# CLAUDE.md

All code produced in this repository will be reviewed and validated by an automated agent such as OpenAI Codex or equivalent.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website + headless CMS ("Personal OS") built with Next.js 14 (Pages Router). Supports two modes: static portfolio (zero-config with mock data) and dynamic CMS with Supabase backend. Deployed as a static export to GitHub Pages.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server on port 8889 |
| `npm run build` | Production build + static export to `./out/` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Architecture

### Dual-Mode Data Layer

All API calls check if Supabase is configured. If not, mock data from `src/lib/fallback-data.ts` is returned. This enables zero-config static deployment without a database.

### State Management (Redux Toolkit + RTK Query)

- **`src/store/api/publicApi.ts`** — 6 queries for public content (no auth). Uses `fakeBaseQuery()` with direct Supabase calls.
- **`src/store/api/adminApi.ts`** — 50+ endpoints for admin CRUD. Tag-based cache invalidation.
- **`src/store/api/mutation-factory.ts`** — DRY helper for generating RTK Query mutations.
- **`src/store/slices/`** — Local state for focus timer and learning sessions.

### Routing

- **Pages Router** (`src/pages/`): 32 pages total.
- **Public pages**: `/`, `/about`, `/projects`, `/contact`, `/blog`, `/blog/view/[slug]`, `/[...slug]` (catch-all).
- **Admin pages** (`src/pages/admin/`): 18 protected pages — dashboard, tasks, finance, habits, learning, calendar, notes, content CMS, blog editor, settings, security.
- **Auth guard**: `src/hooks/useAuthGuard.ts` protects admin routes.

### Validation

Zod schemas in `src/lib/schemas.ts` (50+ schemas) are used with React Hook Form via `@hookform/resolvers`. Types are inferred from schemas with `z.infer<>`.

### Styling

- Tailwind CSS with class-based dark mode. 50+ theme presets defined as CSS variables in `src/styles/globals.css`.
- UI primitives from Shadcn/Radix in `src/components/ui/`.
- Animations via Framer Motion.

### Key Directories

- `src/components/admin/` — Admin dashboard components (~80 files), organized by feature (tasks/, finance/, habits/, learning/, etc.)
- `src/components/public/` — Public-facing page components
- `src/components/ui/` — Shadcn UI primitives (40+ components)
- `src/lib/` — Config, constants, utilities, Zod schemas, fallback data
- `src/types/index.ts` — Central TypeScript interfaces (150+ types)
- `src/supabase/client.ts` — Supabase client initialization
- `db/schema.sql` — Full database schema (21+ tables with RLS policies)

### Auth & Security

Supabase Auth with mandatory MFA/TOTP. Row Level Security on all tables — public read for published content, admin-only write. Session max age: 24 hours.

### Environment Variables

Required for dynamic mode:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_BUCKET_NAME        # Storage bucket, default "assets"
NEXT_PUBLIC_SITE_URL           # Deployed URL (required for builds)
```

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).
