-- db/seed.sql
--
-- Seed data generated from portfolioConfig (config.ts).
-- Run AFTER schema.sql in the Supabase SQL Editor.
--
-- Safe to re-run: this script WIPES the following tables before re-inserting:
--   site_identity (single row, UPSERTed)
--   navigation_links
--   portfolio_sections  (cascades to portfolio_items)
--   blog_posts
--   public_notes
--
-- User-specific data (tasks, notes, transactions, habits, focus_logs,
-- learning_*, inventory_items, storage_assets, contact_submissions) is
-- NEVER touched by this script.

BEGIN;

-- =========================================================
-- 0. CLEAR PUBLIC CONTENT
-- =========================================================
DELETE FROM portfolio_sections;   -- cascades to portfolio_items
DELETE FROM navigation_links;
DELETE FROM blog_posts;
DELETE FROM public_notes;


-- =========================================================
-- 1. SITE IDENTITY  (UPSERT — single row, id = 1)
-- =========================================================
INSERT INTO site_identity (id, profile_data, social_links, footer_data, portfolio_mode)
VALUES (
  1,
  $json$
  {
    "name": "John Doe",
    "title": "Full Stack Engineer",
    "description": "I build fast, scalable web apps — from pixel-perfect UIs to bulletproof APIs.",
    "profile_picture_url": "https://github.com/shadcn.png",
    "show_profile_picture": true,
    "default_theme": "theme-github-light",
    "typography_preset": "typo-default",
    "updates_layout": "scrapbook",
    "logo": { "main": "John", "highlight": ".dev" },
    "bio": [
      "I'm a full stack engineer with 6+ years of experience turning ideas into production-ready products. I've worked across early-stage startups and mid-size SaaS companies, owning features end-to-end — from database schema to deployed UI.",
      "Outside of work, I contribute to open source, write about developer tooling on my blog, and occasionally mentor junior devs. When I'm not at a keyboard, I'm probably hiking or losing at chess."
    ],
    "status_panel": {
      "show": true,
      "design": "minimal",
      "title": "Current Status",
      "availability": "Open to new opportunities",
      "currently_exploring": {
        "title": "Learning",
        "items": ["Rust", "WebAssembly", "AI-assisted tooling"]
      },
      "latestProject": {
        "name": "Taskflow — AI Task Manager",
        "linkText": "View on GitHub",
        "href": "https://github.com/vercel/next.js"
      }
    },
    "github_projects_config": {
      "username": "vercel",
      "show": true,
      "sort_by": "pushed",
      "exclude_forks": true,
      "exclude_archived": true,
      "exclude_profile_repo": true,
      "min_stars": 0,
      "projects_per_page": 6
    },
    "contact_page": {
      "show_contact_form": true,
      "show_availability_badge": true,
      "show_services": true
    }
  }
  $json$::jsonb,
  $json$
  [
    {"id": "github",   "label": "GitHub",   "url": "https://github.com/vercel",       "is_visible": true},
    {"id": "linkedin", "label": "LinkedIn", "url": "https://linkedin.com/in/vercel",  "is_visible": true},
    {"id": "email",    "label": "Email",    "url": "mailto:john@foliokit.dev",        "is_visible": true},
    {"id": "twitter",  "label": "Twitter",  "url": "https://twitter.com/vercel",      "is_visible": true}
  ]
  $json$::jsonb,
  $json${ "copyright_text": "Powered by **Foliokit**." }$json$::jsonb,
  'multi-page'
)
ON CONFLICT (id) DO UPDATE SET
  profile_data   = EXCLUDED.profile_data,
  social_links   = EXCLUDED.social_links,
  footer_data    = EXCLUDED.footer_data,
  portfolio_mode = EXCLUDED.portfolio_mode,
  updated_at     = now();


-- =========================================================
-- 2. NAVIGATION LINKS
-- =========================================================
INSERT INTO navigation_links (label, href, display_order, is_visible) VALUES
  ('Home',     '/',         0, true),
  ('Showcase', '/showcase', 1, true),
  ('About',    '/about',    2, true),
  ('Projects', '/projects', 3, true),
  ('Blog',     '/blog',     4, true),
  ('Updates',  '/updates',  5, true),
  ('Contact',  '/contact',  6, true);


-- =========================================================
-- 3. /about  —  EXPERIENCE
-- =========================================================
WITH s AS (
  INSERT INTO portfolio_sections (title, type, display_order, page_path, layout_style, is_visible)
  VALUES ('Experience', 'list_items', 0, '/about', 'timeline', true)
  RETURNING id
)
INSERT INTO portfolio_items (section_id, title, subtitle, date_from, date_to, description, tags, display_order)
SELECT s.id, v.title, v.subtitle, v.date_from, v.date_to, v.description, v.tags, v.display_order
FROM s, (VALUES
  (
    'Senior Full Stack Engineer', 'Streamline Inc.', '2021', 'Present',
    'Lead engineer on a B2B SaaS dashboard used by 40,000+ users. Migrated a legacy Rails monolith to a Next.js + Node.js microservices architecture, cutting p95 latency by 60%. Mentored a team of 4 junior developers.',
    ARRAY['Next.js','Node.js','PostgreSQL','AWS','Docker'],
    0
  ),
  (
    'Full Stack Developer', 'Brightloop Agency', '2019', '2021',
    'Built and shipped client-facing web applications for e-commerce and marketing verticals. Owned the full delivery cycle from scoping to deployment across 12+ client projects.',
    ARRAY['React','GraphQL','Shopify','GSAP','Tailwind CSS'],
    1
  ),
  (
    'Junior Web Developer', 'DevNest Studios', '2018', '2019',
    'Developed internal tools and customer-facing features for a local SaaS startup. First professional exposure to agile workflows, code review culture, and CI/CD pipelines.',
    ARRAY['Vue.js','Python','Django','MySQL'],
    2
  )
) AS v(title, subtitle, date_from, date_to, description, tags, display_order);


-- =========================================================
-- 4. /about  —  TECH STACK
-- =========================================================
WITH s AS (
  INSERT INTO portfolio_sections (title, type, display_order, page_path, layout_style, is_visible)
  VALUES ('Tech Stack', 'list_items', 1, '/about', 'grid', true)
  RETURNING id
)
INSERT INTO portfolio_items (section_id, title, description, display_order)
SELECT s.id, v.title, v.description, v.display_order
FROM s, (VALUES
  ('React / Next.js',   'Component architecture, SSR, App Router, hooks', 0),
  ('TypeScript',        'Static typing, generics, advanced interface design', 1),
  ('Node.js / Express', 'REST APIs, middleware, background jobs', 2),
  ('PostgreSQL',        'Schema design, query optimization, Prisma ORM', 3),
  ('Tailwind CSS',      'Responsive UI, design systems, dark mode', 4),
  ('Docker & CI/CD',    'Containerization, GitHub Actions, AWS ECS', 5)
) AS v(title, description, display_order);


-- =========================================================
-- 5. /about  —  TOOLS
-- =========================================================
WITH s AS (
  INSERT INTO portfolio_sections (title, type, display_order, page_path, layout_style, is_visible)
  VALUES ('Tools', 'list_items', 2, '/about', 'grid', true)
  RETURNING id
)
INSERT INTO portfolio_items (section_id, title, description, display_order)
SELECT s.id, v.title, v.description, v.display_order
FROM s, (VALUES
  ('VS Code', 'Daily driver — heavily customized with Vim bindings.', 0),
  ('Figma',   'UI mockups and component specs before any code is written.', 1),
  ('Warp',    'Terminal of choice — AI autocomplete saves real time.', 2),
  ('Linear',  'Project and issue tracking. Keeps sprints honest.', 3)
) AS v(title, description, display_order);


-- =========================================================
-- 6. /about  —  EDUCATION
-- =========================================================
WITH s AS (
  INSERT INTO portfolio_sections (title, type, display_order, page_path, layout_style, is_visible)
  VALUES ('Education', 'list_items', 3, '/about', 'timeline', true)
  RETURNING id
)
INSERT INTO portfolio_items (section_id, title, subtitle, date_from, date_to, description, display_order)
SELECT s.id, v.title, v.subtitle, v.date_from, v.date_to, v.description, v.display_order
FROM s, (VALUES
  (
    'B.Sc. Computer Science',
    'State University of New York',
    '2014', '2018',
    'Graduated with Honours. Focused on software engineering and distributed systems. Final thesis on peer-to-peer file sync algorithms.',
    0
  )
) AS v(title, subtitle, date_from, date_to, description, display_order);


-- =========================================================
-- 7. /showcase  —  FEATURED WORK
-- =========================================================
WITH s AS (
  INSERT INTO portfolio_sections (title, type, display_order, page_path, layout_style, is_visible)
  VALUES ('Featured Work', 'list_items', 0, '/showcase', 'default', true)
  RETURNING id
)
INSERT INTO portfolio_items (section_id, title, description, link_url, tags, display_order)
SELECT s.id, v.title, v.description, v.link_url, v.tags, v.display_order
FROM s, (VALUES
  (
    'Rebuilding a Monolith into Microservices',
    'A behind-the-scenes look at how I led the migration of a 200k-line Rails app to a distributed Node.js architecture — including the mistakes, tradeoffs, and wins.',
    'https://github.com/vercel/next.js',
    ARRAY['System Design','Node.js','AWS'],
    0
  ),
  (
    $txt$Zero to 40k Users: Scaling Streamline's Dashboard$txt$,
    'How I optimized a React dashboard from a 6-second initial load to under 900ms using code splitting, edge caching, and smarter data fetching.',
    'https://github.com/vercel/next.js',
    ARRAY['Performance','Next.js','CDN'],
    1
  )
) AS v(title, description, link_url, tags, display_order);


-- =========================================================
-- 8. /projects  —  FEATURED PROJECTS
-- =========================================================
WITH s AS (
  INSERT INTO portfolio_sections (title, type, display_order, page_path, layout_style, is_visible)
  VALUES ('Projects', 'gallery', 0, '/projects', 'default', true)
  RETURNING id
)
INSERT INTO portfolio_items (section_id, title, subtitle, description, link_url, image_url, tags, display_order)
SELECT s.id, v.title, v.subtitle, v.description, v.link_url, v.image_url, v.tags, v.display_order
FROM s, (VALUES
  (
    'Taskflow', 'AI-Powered Task Manager',
    $txt$A productivity app that uses AI to auto-prioritize your task list based on deadlines, energy levels, and past completion patterns.

[View Source on GitHub](https://github.com/vercel/next.js)$txt$,
    'https://github.com/vercel/next.js',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop',
    ARRAY['Next.js','OpenAI','Supabase','Tailwind CSS'],
    0
  ),
  (
    'Pricewise', 'SaaS Pricing Page Builder',
    $txt$A drag-and-drop pricing page builder that generates clean, embeddable HTML/React components — no design skills required.

[View Source on GitHub](https://github.com/vercel/next.js)$txt$,
    'https://github.com/vercel/next.js',
    'https://images.unsplash.com/photo-1532354058425-ba7ccc7e4a24?q=80&w=2670&auto=format&fit=crop',
    ARRAY['React','Tailwind CSS','Framer Motion'],
    1
  )
) AS v(title, subtitle, description, link_url, image_url, tags, display_order);


-- =========================================================
-- 9. /contact  —  SERVICES
-- =========================================================
WITH s AS (
  INSERT INTO portfolio_sections (title, type, display_order, page_path, layout_style, is_visible)
  VALUES ('Services', 'list_items', 0, '/contact', 'default', true)
  RETURNING id
)
INSERT INTO portfolio_items (section_id, title, subtitle, description, tags, display_order)
SELECT s.id, v.title, v.subtitle, v.description, v.tags, v.display_order
FROM s, (VALUES
  (
    'Full Stack Development', 'End-to-End Web Apps',
    $txt$From MVP to production — I handle frontend, backend, database, and deployment so you don't have to stitch together three freelancers.$txt$,
    ARRAY['React','Node.js','PostgreSQL','AWS'],
    0
  ),
  (
    'Technical Consulting', 'Architecture & Code Strategy',
    'Struggling with a legacy codebase or planning a new system? I help teams make smart architectural decisions before they become expensive mistakes.',
    ARRAY['System Design','Code Review','Roadmapping'],
    1
  ),
  (
    'Performance Audits', 'Speed & Scalability',
    $txt$I'll profile your app, identify bottlenecks, and deliver a prioritized fix list with measurable impact — not vague suggestions.$txt$,
    ARRAY['Lighthouse','Web Vitals','Database Optimization'],
    2
  )
) AS v(title, subtitle, description, tags, display_order);


-- =========================================================
-- 10. BLOG POSTS
-- =========================================================
INSERT INTO blog_posts (title, slug, excerpt, content, published, published_at, show_toc, tags) VALUES
(
  'Why I Stopped Using useEffect for Data Fetching',
  'stop-using-useeffect-for-data-fetching',
  $txt$useEffect works — but it's rarely the right tool for async data. Here's what I use instead and why it matters for UX.$txt$,
  $md$## The Problem

Every React developer has written this pattern...

```typescript
useEffect(() => {
  fetch('/api/data').then(res => setData(res.json()));
}, []);
```

It works. But it leaks, it races, and it doesn't scale.

## What to Use Instead

React Query (TanStack Query) solves all of this out of the box — caching, deduplication, background refetch, loading states, and error handling.

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['user'],
  queryFn: () => fetch('/api/user').then(r => r.json()),
});
```

### Why It's Better

- No cleanup functions needed
- Automatic deduplication across components
- Stale-while-revalidate built in
- Devtools that actually help$md$,
  true, now(), true,
  ARRAY['React','Performance','Frontend']
),
(
  'The Docker Compose Setup I Use for Every Project',
  'docker-compose-setup-every-project',
  'A battle-tested docker-compose.yml that gives you Postgres, Redis, and a Node API with hot reload in under 5 minutes.',
  $md$## The Stack

Every new project starts with the same foundation:

- **PostgreSQL** — primary database
- **Redis** — caching and queues
- **Node.js API** — with nodemon hot reload

## The Config

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: appdb
  redis:
    image: redis:7-alpine
  api:
    build: .
    volumes:
      - .:/app
    depends_on:
      - db
      - redis
```

Save this, run `docker compose up`, and you're coding in minutes.$md$,
  true, now(), false,
  ARRAY['Docker','DevOps','Backend']
);


-- =========================================================
-- 11. PUBLIC NOTES  (Life Updates)
-- =========================================================
INSERT INTO public_notes (title, content, category, tags, is_pinned, is_published) VALUES
(
  'Shipped Taskflow v1.0 🚀',
  $txt$After 3 months of evenings and weekends, Taskflow is live. 200 beta signups in the first 48 hours. Genuinely didn't expect that.$txt$,
  'milestone',
  ARRAY['Launch','SaaS','Dev'],
  true,  true
),
(
  'Started learning Rust',
  'Three chapters into The Book. The borrow checker humbles you fast. Coming from TypeScript, the mental model shift is real — but I can already see why people love it.',
  'thought',
  ARRAY['Rust','Learning'],
  false, true
),
(
  'Spoke at NodeConf EU',
  'Gave a 20-minute talk on migrating monoliths to microservices. Terrifying but worth it. Slides are up on my GitHub.',
  'milestone',
  ARRAY['Speaking','Node.js','Conference'],
  false, true
);


COMMIT;

-- =========================================================
-- SANITY CHECK  (optional — run after commit)
-- =========================================================
-- SELECT 'navigation_links'   AS table, count(*) FROM navigation_links   UNION ALL   -- 7
-- SELECT 'portfolio_sections',         count(*) FROM portfolio_sections  UNION ALL   -- 7
-- SELECT 'portfolio_items',            count(*) FROM portfolio_items     UNION ALL   -- 21
-- SELECT 'blog_posts',                 count(*) FROM blog_posts          UNION ALL   -- 2
-- SELECT 'public_notes',               count(*) FROM public_notes;                   -- 3