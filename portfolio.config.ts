// =============================================================================
// FOLIOKIT - Portfolio Configuration
// =============================================================================

const portfolioConfig = {
  // ---------------------------------------------------------------------------
  // IDENTITY
  // ---------------------------------------------------------------------------
  name: "Akshay Bharadva",
  title: "AI Engineer & Full-Stack Developer",
  description:
    "I build fast, scalable web apps — from pixel-perfect UIs to bulletproof APIs.",
  profilePicture: "https://github.com/akshay-bharadva.png",
  showProfilePicture: true,

  logo: {
    main: "AKSHAY",
    highlight: ".DEV",
  },

  bio: [
    "I'm a full stack engineer with 6+ years of experience turning ideas into production-ready products. I've worked across early-stage startups and mid-size SaaS companies, owning features end-to-end — from database schema to deployed UI.",
    "Outside of work, I contribute to open source, write about developer tooling on my blog, and occasionally mentor junior devs. When I'm not at a keyboard, I'm probably hiking or losing at chess.",
  ],

  // ---------------------------------------------------------------------------
  // THEME
  // ---------------------------------------------------------------------------
  defaultTheme: "theme-github-light",
  typographyPreset: "typo-default",
  portfolioMode: "multi-page" as const,

  // ---------------------------------------------------------------------------
  // STATUS PANEL
  // ---------------------------------------------------------------------------
  statusPanel: {
    show: true,
    design: "minimal" as const,
    title: "Current Status",
    availability: "Open to new opportunities",
    currentlyExploring: {
      title: "Learning",
      items: ["Rust", "WebAssembly", "AI-assisted tooling"],
    },
    latestProject: {
      name: "Taskflow — AI Task Manager",
      linkText: "View on GitHub",
      href: "https://github.com/vercel/next.js",
    },
  },

  // ---------------------------------------------------------------------------
  // SOCIAL LINKS
  // ---------------------------------------------------------------------------
  socialLinks: [
    { id: "github", label: "GitHub", url: "https://github.com/akshay-bharadva" },
    { id: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/akshay-bharadva" },
    { id: "email", label: "Email", url: "mailto:john@foliokit.dev" },
    { id: "twitter", label: "Twitter", url: "https://twitter.com/akshay-bharadva" },
  ],

  // ---------------------------------------------------------------------------
  // FOOTER
  // ---------------------------------------------------------------------------
  footerText:
    "Powered by **Foliokit**.",

  // ---------------------------------------------------------------------------
  // GITHUB PROJECTS
  // ---------------------------------------------------------------------------
  github: {
    username: "vercel",
    show: true,
    sortBy: "pushed" as const,
    excludeForks: true,
    excludeArchived: true,
    excludeProfileRepo: true,
    minStars: 0,
    projectsPerPage: 6,
  },

  // ---------------------------------------------------------------------------
  // CONTACT PAGE
  // ---------------------------------------------------------------------------
  contact: {
    showContactForm: true,
    showAvailabilityBadge: true,
    showServices: true,
  },

  // ---------------------------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------------------------
  navLinks: [
    { label: "Home", href: "/" },
    { label: "Showcase", href: "/showcase" },
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Blog", href: "/blog" },
    { label: "Updates", href: "/updates" },
    { label: "Contact", href: "/contact" },
  ],

  // ---------------------------------------------------------------------------
  // EXPERIENCE
  // ---------------------------------------------------------------------------
  experience: [
    {
      title: "Senior Full Stack Engineer",
      company: "Streamline Inc.",
      from: "2021",
      to: "Present",
      description:
        "Lead engineer on a B2B SaaS dashboard used by 40,000+ users. Migrated a legacy Rails monolith to a Next.js + Node.js microservices architecture, cutting p95 latency by 60%. Mentored a team of 4 junior developers.",
      tags: ["Next.js", "Node.js", "PostgreSQL", "AWS", "Docker"],
    },
    {
      title: "Full Stack Developer",
      company: "Brightloop Agency",
      from: "2019",
      to: "2021",
      description:
        "Built and shipped client-facing web applications for e-commerce and marketing verticals. Owned the full delivery cycle from scoping to deployment across 12+ client projects.",
      tags: ["React", "GraphQL", "Shopify", "GSAP", "Tailwind CSS"],
    },
    {
      title: "Junior Web Developer",
      company: "DevNest Studios",
      from: "2018",
      to: "2019",
      description:
        "Developed internal tools and customer-facing features for a local SaaS startup. First professional exposure to agile workflows, code review culture, and CI/CD pipelines.",
      tags: ["Vue.js", "Python", "Django", "MySQL"],
    },
  ],

  // ---------------------------------------------------------------------------
  // TECH STACK
  // ---------------------------------------------------------------------------
  techStack: [
    { title: "React / Next.js", description: "Component architecture, SSR, App Router, hooks" },
    { title: "TypeScript", description: "Static typing, generics, advanced interface design" },
    { title: "Node.js / Express", description: "REST APIs, middleware, background jobs" },
    { title: "PostgreSQL", description: "Schema design, query optimization, Prisma ORM" },
    { title: "Tailwind CSS", description: "Responsive UI, design systems, dark mode" },
    { title: "Docker & CI/CD", description: "Containerization, GitHub Actions, AWS ECS" },
  ],

  // ---------------------------------------------------------------------------
  // TOOLS
  // ---------------------------------------------------------------------------
  tools: [
    { title: "VS Code", description: "Daily driver — heavily customized with Vim bindings." },
    { title: "Figma", description: "UI mockups and component specs before any code is written." },
    { title: "Warp", description: "Terminal of choice — AI autocomplete saves real time." },
    { title: "Linear", description: "Project and issue tracking. Keeps sprints honest." },
  ],

  // ---------------------------------------------------------------------------
  // EDUCATION
  // ---------------------------------------------------------------------------
  education: [
    {
      title: "B.Sc. Computer Science",
      institution: "State University of New York",
      from: "2014",
      to: "2018",
      description:
        "Graduated with Honours. Focused on software engineering and distributed systems. Final thesis on peer-to-peer file sync algorithms.",
    },
  ],

  // ---------------------------------------------------------------------------
  // SHOWCASE
  // ---------------------------------------------------------------------------
  showcase: [
    {
      title: "Rebuilding a Monolith into Microservices",
      description:
        "A behind-the-scenes look at how I led the migration of a 200k-line Rails app to a distributed Node.js architecture — including the mistakes, tradeoffs, and wins.",
      link: "https://github.com/vercel/next.js",
      tags: ["System Design", "Node.js", "AWS"],
    },
    {
      title: "Zero to 40k Users: Scaling Streamline's Dashboard",
      description:
        "How I optimized a React dashboard from a 6-second initial load to under 900ms using code splitting, edge caching, and smarter data fetching.",
      link: "https://github.com/vercel/next.js",
      tags: ["Performance", "Next.js", "CDN"],
    },
  ],

  // ---------------------------------------------------------------------------
  // FEATURED PROJECTS
  // ---------------------------------------------------------------------------
  projects: [
    {
      title: "Taskflow",
      subtitle: "AI-Powered Task Manager",
      description:
        "A productivity app that uses AI to auto-prioritize your task list based on deadlines, energy levels, and past completion patterns.\n\n[View Source on GitHub](https://github.com/vercel/next.js)",
      tags: ["Next.js", "OpenAI", "Supabase", "Tailwind CSS"],
      link: "https://github.com/vercel/next.js",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
    },
    {
      title: "Pricewise",
      subtitle: "SaaS Pricing Page Builder",
      description:
        "A drag-and-drop pricing page builder that generates clean, embeddable HTML/React components — no design skills required.\n\n[View Source on GitHub](https://github.com/vercel/next.js)",
      tags: ["React", "Tailwind CSS", "Framer Motion"],
      link: "https://github.com/vercel/next.js",
      image:
        "https://images.unsplash.com/photo-1532354058425-ba7ccc7e4a24?q=80&w=2670&auto=format&fit=crop",
    },
  ],

  // ---------------------------------------------------------------------------
  // SERVICES
  // ---------------------------------------------------------------------------
  services: [
    {
      title: "Full Stack Development",
      subtitle: "End-to-End Web Apps",
      description:
        "From MVP to production — I handle frontend, backend, database, and deployment so you don't have to stitch together three freelancers.",
      tags: ["React", "Node.js", "PostgreSQL", "AWS"],
    },
    {
      title: "Technical Consulting",
      subtitle: "Architecture & Code Strategy",
      description:
        "Struggling with a legacy codebase or planning a new system? I help teams make smart architectural decisions before they become expensive mistakes.",
      tags: ["System Design", "Code Review", "Roadmapping"],
    },
    {
      title: "Performance Audits",
      subtitle: "Speed & Scalability",
      description:
        "I'll profile your app, identify bottlenecks, and deliver a prioritized fix list with measurable impact — not vague suggestions.",
      tags: ["Lighthouse", "Web Vitals", "Database Optimization"],
    },
  ],

  // ---------------------------------------------------------------------------
  // BLOG POSTS
  // ---------------------------------------------------------------------------
  blogPosts: [
    {
      title: "Why I Stopped Using useEffect for Data Fetching",
      slug: "stop-using-useeffect-for-data-fetching",
      excerpt:
        "useEffect works — but it's rarely the right tool for async data. Here's what I use instead and why it matters for UX.",
      content:
        "## The Problem\n\nEvery React developer has written this pattern...\n\n```typescript\nuseEffect(() => {\n  fetch('/api/data').then(res => setData(res.json()));\n}, []);\n```\n\nIt works. But it leaks, it races, and it doesn't scale.\n\n## What to Use Instead\n\nReact Query (TanStack Query) solves all of this out of the box — caching, deduplication, background refetch, loading states, and error handling.\n\n```typescript\nconst { data, isLoading } = useQuery({\n  queryKey: ['user'],\n  queryFn: () => fetch('/api/user').then(r => r.json()),\n});\n```\n\n### Why It's Better\n\n- No cleanup functions needed\n- Automatic deduplication across components\n- Stale-while-revalidate built in\n- Devtools that actually help",
      tags: ["React", "Performance", "Frontend"],
      showToc: true,
    },
    {
      title: "The Docker Compose Setup I Use for Every Project",
      slug: "docker-compose-setup-every-project",
      excerpt:
        "A battle-tested docker-compose.yml that gives you Postgres, Redis, and a Node API with hot reload in under 5 minutes.",
      content:
        "## The Stack\n\nEvery new project starts with the same foundation:\n\n- **PostgreSQL** — primary database\n- **Redis** — caching and queues\n- **Node.js API** — with nodemon hot reload\n\n## The Config\n\n```yaml\nversion: '3.8'\nservices:\n  db:\n    image: postgres:15\n    environment:\n      POSTGRES_USER: dev\n      POSTGRES_PASSWORD: dev\n      POSTGRES_DB: appdb\n  redis:\n    image: redis:7-alpine\n  api:\n    build: .\n    volumes:\n      - .:/app\n    depends_on:\n      - db\n      - redis\n```\n\nSave this, run `docker compose up`, and you're coding in minutes.",
      tags: ["Docker", "DevOps", "Backend"],
      showToc: false,
    },
  ],

  // ---------------------------------------------------------------------------
  // LIFE UPDATES
  // ---------------------------------------------------------------------------
  updatesLayout: "scrapbook" as const,

  lifeUpdates: [
    {
      title: "Shipped Taskflow v1.0 🚀",
      content:
        "After 3 months of evenings and weekends, Taskflow is live. 200 beta signups in the first 48 hours. Genuinely didn't expect that.",
      category: "milestone" as const,
      tags: ["Launch", "SaaS", "Dev"],
      isPinned: true,
    },
    {
      title: "Started learning Rust",
      content:
        "Three chapters into The Book. The borrow checker humbles you fast. Coming from TypeScript, the mental model shift is real — but I can already see why people love it.",
      category: "thought" as const,
      tags: ["Rust", "Learning"],
      isPinned: false,
    },
    {
      title: "Spoke at NodeConf EU",
      content:
        "Gave a 20-minute talk on migrating monoliths to microservices. Terrifying but worth it. Slides are up on my GitHub.",
      category: "milestone" as const,
      tags: ["Speaking", "Node.js", "Conference"],
      isPinned: false,
    },
  ],
};

export default portfolioConfig;