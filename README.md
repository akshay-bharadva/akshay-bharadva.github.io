# Foliokit

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-optional-3ECF8E?style=flat-square&logo=supabase)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

A developer portfolio template + personal CMS. Clone it, edit one config file, deploy. Optionally connect Supabase to unlock a full admin dashboard — blog, tasks, finance, habits, learning, calendar, and more.

**One config file. 30 themes. Zero lock-in.**

---

## Table of Contents

- [Quick Start](#quick-start)
- [Two Modes](#two-modes)
- [The Config File](#the-config-file)
- [Themes](#themes)
- [Typography](#typography)
- [Deployment](#deployment)
- [Dynamic Mode Setup](#dynamic-mode-setup)
- [Admin Dashboard](#admin-dashboard)
- [Project Structure](#project-structure)
- [Commands](#commands)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/akshay-bharadva/foliokit.git
cd foliokit && npm install

# 2. Configure
#    Open portfolio.config.ts and replace demo values with yours.

# 3. Run
npm run dev        # Dev server at http://localhost:8889
npm run build      # Static export to ./out/
```

No database. No env vars. No API keys required.

---

## Two Modes

Foliokit auto-detects its mode at runtime based on environment variables.

### Static Mode (default)

- Reads everything from `portfolio.config.ts`
- No database, no auth, no backend
- Fully static-exported (`output: "export"`)
- Deploys to GitHub Pages, Vercel, Netlify, Cloudflare Pages, or any static host

### Dynamic Mode (opt-in)

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` and you unlock:

- `/admin` dashboard (18 protected pages)
- Portfolio CMS, blog editor, life updates feed
- Task manager, habit tracker, finance tracker, learning hub, calendar, notes, inventory
- Asset manager with storage bucket browser
- Supabase Auth with **mandatory TOTP MFA**
- Row Level Security on every table

The public site stays statically exported — all data fetching happens client-side against Supabase.

---

## The Config File

`portfolio.config.ts` is the single source of truth in static mode, and the initial seed in dynamic mode.

| Section | What it controls |
|---------|-------------------|
| `name`, `title`, `description` | Hero identity |
| `bio` | About-page paragraphs |
| `logo.{main,highlight}` | Two-tone header logo |
| `defaultTheme` | One of 30 themes |
| `typographyPreset` | One of 8 font pairings |
| `portfolioMode` | `"multi-page"` or `"single-page"` |
| `statusPanel` | Right-side hero widget — `minimal`, `terminal`, or `bento` variant |
| `socialLinks` | GitHub, LinkedIn, email, Twitter, etc. |
| `navLinks` | Header navigation |
| `experience` | Work timeline |
| `techStack`, `tools` | Skills grid + tooling |
| `education` | Education timeline |
| `projects` | Featured projects |
| `showcase` | Deep-dive case studies |
| `services` | `/contact` offerings |
| `blogPosts` | Static Markdown blog posts |
| `lifeUpdates` | `/updates` feed entries |
| `updatesLayout` | `"timeline"` or `"scrapbook"` |
| `github` | Live GitHub repo fetch (filters, pagination) |
| `contact` | Availability badge, services panel, contact form toggle |

---

## Themes

30 curated themes, all CSS-variable based. Visitors can switch live; your default is just the starting point.

```typescript
defaultTheme: "theme-nord",
```

| Category | Themes |
|----------|--------|
| **Dark** | `theme-dracula`, `theme-nord`, `theme-tokyo-night`, `theme-catppuccin-mocha`, `theme-github-dark`, `theme-onedark-pro`, `theme-rose-pine`, `theme-monokai`, `theme-ayu-dark` |
| **Light** | `theme-solarized-light`, `theme-catppuccin-latte`, `theme-github-light`, `theme-arctic`, `theme-paper` |
| **Special** | `theme-blueprint`, `theme-cyberpunk`, `theme-ocean`, `theme-matrix`, `theme-terminal` |
| **High contrast** | `theme-hc-dark`, `theme-hc-light` |
| **Neobrutalism** | `theme-neobrutalism-light`, `theme-neobrutalism-dark`, `theme-neobrutalism-punk` |
| **Glass** | `theme-glass-dark`, `theme-glass-frost`, `theme-glass-aurora`, `theme-glass-ocean` |
| **Retro** | `theme-synthwave`, `theme-retrowave` |

Want custom colors? Dynamic mode ships a `theme-custom` option that takes 6 hex values and converts them to HSL at runtime.

---

## Typography

8 font-pair presets. Set via `typographyPreset` in config, or live-switch in admin settings.

`typo-default`, `typo-editorial`, `typo-modern-tech`, `typo-elegant`, `typo-bold-quirky`, `typo-futuristic`, `typo-classic-pro`, `typo-geometric`

---

## Deployment

### GitHub Pages

1. Push to GitHub
2. **Settings → Pages → Source: GitHub Actions**
3. Done — the included `.github/workflows/next-deploy.yml` handles the rest.

For dynamic mode, add these as GitHub Secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (your deployed URL)

### Vercel / Netlify / Cloudflare Pages

Import the repo, add env vars if using Supabase, deploy. No config needed.

### Manual

```bash
npm run build    # Outputs ./out/
```

Upload `./out/` to any static host.

### Included Workflows

| Workflow | Static mode | Dynamic mode |
|----------|-------------|--------------|
| `next-deploy.yml` | Optional — builds + deploys on push to `main` | Required — injects Supabase secrets at build |
| `keep-supabase-active.yml` | Auto-skipped when `NEXT_PUBLIC_SUPABASE_URL` is unset | Required — pings Supabase every 24h so the free tier doesn't pause after 7 days of inactivity |

---

## Dynamic Mode Setup

Want the admin dashboard? Four steps:

1. Create a free project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local` and fill in keys
3. Run `db/schema.sql` in the Supabase SQL editor (creates 23 tables + RLS policies + seed)
4. Create a public storage bucket named `assets`

Then visit `/admin/signup` to create your admin account. You'll be prompted to enroll TOTP MFA on first login.

---

## Admin Dashboard

18 protected pages, all guarded by `useAuthGuard` (requires AAL2 / MFA).

| Route | Feature |
|-------|---------|
| `/admin` | Dashboard overview (tasks, finance, habits, learning KPIs) |
| `/admin/blog` | Blog post editor (Tiptap/Novel) |
| `/admin/content` | Portfolio CMS — sections + items per page |
| `/admin/life-updates` | `/updates` feed editor |
| `/admin/tasks` | Task manager — Kanban / Table / Tree views, sub-tasks |
| `/admin/finance` | Income, expenses, recurring transactions, goals, monthly analytics |
| `/admin/habits` | Habit tracker with heatmaps + streaks |
| `/admin/learning` | Subjects, topics, timed study sessions |
| `/admin/calendar` | FullCalendar unified view (tasks + events + habits) |
| `/admin/notes` | Sticky-notes editor |
| `/admin/inventory` | Personal inventory CRUD |
| `/admin/assets` | Storage bucket browser + usage scan |
| `/admin/navigation` | Reorder public nav links |
| `/admin/settings` | Brand, theme, typography, hero, GitHub, contact, social, footer |
| `/admin/security` | Lockdown level, password change, MFA unenroll |

---

## Project Structure

```
foliokit/
├── portfolio.config.ts           # YOUR CONFIG — edit this
├── next.config.js                # output: "export", trailingSlash, unoptimized images
├── tailwind.config.js            # Tailwind + CSS-variable theme wiring
├── .env.example                  # Env vars for dynamic mode
├── .github/workflows/
│   ├── next-deploy.yml           # GH Pages deploy on push to main
│   └── keep-supabase-active.yml  # Daily Supabase heartbeat ping
├── db/
│   ├── schema.sql                # 23 tables + RLS + seed
│   └── john-doe.sample.sql       # Demo persona seed
├── public/                       # Static assets
└── src/
    ├── pages/                    # 32 pages (14 public + 18 admin)
    ├── components/
    │   ├── admin/                # Dashboard components (~80 files, 13 feature areas)
    │   ├── sections/             # 20 section layouts for CMS catch-all
    │   ├── public/               # Public-page components
    │   └── ui/                   # 51 Shadcn/Radix primitives
    ├── store/
    │   ├── api/
    │   │   ├── publicApi.ts      # 10 public endpoints
    │   │   ├── adminApi.ts       # 71 admin endpoints
    │   │   └── mutation-factory.ts
    │   └── slices/               # Focus timer + learning session state
    ├── lib/
    │   ├── fallback-data.ts      # Maps portfolio.config.ts → mock RTK payloads
    │   ├── schemas.ts            # 19 Zod schemas (form validation)
    │   ├── config.ts             # isSupabaseConfigured + AppConfig
    │   └── constants.ts          # Themes, typography, enums, limits
    ├── hooks/                    # 7 custom hooks (auth guard, mobile, toast, etc.)
    ├── supabase/client.ts        # Nullable Supabase client
    ├── styles/globals.css        # Tailwind + 30 theme presets + 8 typography presets
    └── types/index.ts            # 29 central TypeScript interfaces
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port **8889** |
| `npm run build` | Production build + static export to `./out/` |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

## Tech Stack

**Framework:** Next.js 14 (Pages Router) · React 18 · TypeScript 5

**State & Data:** Redux Toolkit · RTK Query · Supabase (optional)

**Forms & Validation:** React Hook Form · Zod · `@hookform/resolvers`

**Styling:** Tailwind CSS · Shadcn/Radix UI · Framer Motion · `class-variance-authority`

**Content:** Tiptap + Novel (rich-text) · `react-markdown` · `rehype-prism-plus` (syntax highlighting)

**Visualization:** Recharts · FullCalendar

**Security:** Supabase Auth · mandatory TOTP MFA · RLS on every table

---

## Environment Variables

All variables are `NEXT_PUBLIC_*` (the app is fully client-rendered after export).

| Variable | Required? | Purpose |
|----------|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Dynamic mode | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dynamic mode | Anon key (RLS handles authorization) |
| `NEXT_PUBLIC_BUCKET_NAME` | Optional | Storage bucket name, default `"assets"` |
| `NEXT_PUBLIC_SITE_URL` | For builds | Canonical URL (OG tags, sitemap) |
| `NEXT_PUBLIC_VISIT_NOTIFIER_URL` | Optional | Discord webhook — ping on visit |
| `NEXT_PUBLIC_CONTACT_WEBHOOK_URL` | Optional | Discord webhook — ping on contact form submit |
| `NEXT_PUBLIC_APP_NAME` | Optional | MFA app name override |
| `NEXT_PUBLIC_MFA_ISSUER` | Optional | MFA issuer override |

Static mode requires zero env vars.

---

## Contributing

Contributions welcome! The workflow:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit with a clear message
4. Open a pull request

For larger changes, please open an issue first to discuss direction.

---

## License

[MIT](LICENSE) — use it for anything, commercial or personal.

---

Built with Foliokit by [Akshay Bharadva](https://github.com/akshay-bharadva). If you ship something with this, I'd love to see it.
