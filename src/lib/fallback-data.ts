// Auto-generated from portfolio.config.ts — edit the config file, not this one.

import type { SiteContent, PortfolioSection, BlogPost, LifeUpdate } from "@/types";
import config from "../../portfolio.config";

// --- 0. NAVIGATION ---
export const MOCK_NAV_LINKS = config.navLinks;

// --- 1. GLOBAL IDENTITY (Header, Footer, Hero) ---
export const MOCK_SITE_IDENTITY: SiteContent = {
  portfolio_mode: config.portfolioMode,
  profile_data: {
    name: config.name,
    title: config.title,
    description: config.description,
    profile_picture_url: config.profilePicture,
    show_profile_picture: config.showProfilePicture,
    default_theme: config.defaultTheme,
    logo: config.logo,
    status_panel: {
      show: config.statusPanel.show,
      design: config.statusPanel.design,
      title: config.statusPanel.title,
      availability: config.statusPanel.availability,
      currently_exploring: {
        title: config.statusPanel.currentlyExploring.title,
        items: config.statusPanel.currentlyExploring.items,
      },
      latestProject: config.statusPanel.latestProject,
    },
    bio: config.bio,
    github_projects_config: {
      username: config.github.username,
      show: config.github.show,
      sort_by: config.github.sortBy,
      exclude_forks: config.github.excludeForks,
      exclude_archived: config.github.excludeArchived,
      exclude_profile_repo: config.github.excludeProfileRepo,
      min_stars: config.github.minStars,
      projects_per_page: config.github.projectsPerPage,
    },
    contact_page: {
      show_contact_form: config.contact.showContactForm,
      show_availability_badge: config.contact.showAvailabilityBadge,
      show_services: config.contact.showServices,
    },
    updates_layout: config.updatesLayout,
    typography_preset: config.typographyPreset,
  },
  social_links: config.socialLinks.map((link) => ({
    ...link,
    is_visible: true,
  })),
  footer_data: {
    copyright_text: config.footerText,
  },
};

// --- 2. LIFE UPDATES (For /updates) ---
export const MOCK_LIFE_UPDATES: LifeUpdate[] = config.lifeUpdates.map(
  (update, i) => ({
    id: `lu-${i + 1}`,
    title: update.title,
    content: update.content,
    category: update.category,
    tags: update.tags,
    is_pinned: update.isPinned,
    is_published: true,
    created_at: new Date(Date.now() - 86400000 * i * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * i * 3).toISOString(),
  }),
);

// --- 3. BLOG POSTS (For /blog) ---
export const MOCK_BLOG_POSTS: BlogPost[] = config.blogPosts.map((post, i) => ({
  id: String(i + 1),
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  content: post.content,
  published: true,
  published_at: new Date(Date.now() - 86400000 * i * 5).toISOString(),
  show_toc: post.showToc ?? false,
  tags: post.tags,
  // views: 0, // If you wants to show the No. of Views
  created_at: new Date(Date.now() - 86400000 * i * 5).toISOString(),
  updated_at: new Date(Date.now() - 86400000 * i * 5).toISOString(),
}));

// --- 4. SECTIONS (For Home, About, Showcase, Projects, Contact) ---

// Helper to build section items
function buildItems(
  sectionId: string,
  items: { title: string; subtitle?: string; description?: string; from?: string; to?: string; tags?: string[]; link?: string; image?: string; company?: string; institution?: string }[],
) {
  return items.map((item, i) => ({
    id: `${sectionId}-${i + 1}`,
    section_id: sectionId,
    title: item.title,
    subtitle: item.subtitle || item.company || item.institution,
    date_from: item.from,
    date_to: item.to,
    description: item.description,
    tags: item.tags,
    link_url: item.link,
    image_url: item.image,
  }));
}

export const MOCK_SECTIONS: PortfolioSection[] = [
  // --- HOME PAGE (/) ---
  {
    id: "home-exp",
    title: "Experience",
    type: "list_items",
    page_path: "/",
    layout_style: "timeline",
    is_visible: true,
    display_order: 1,
    portfolio_items: buildItems(
      "home-exp",
      config.experience.map((e) => ({
        title: e.title,
        company: e.company,
        from: e.from,
        to: e.to,
        description: e.description,
        tags: e.tags,
      })),
    ),
  },
  {
    id: "home-tech",
    title: "Tech Stack",
    type: "list_items",
    page_path: "/",
    layout_style: "default",
    is_visible: true,
    display_order: 2,
    portfolio_items: buildItems("home-tech", config.techStack),
  },
  {
    id: "home-tools",
    title: "Tools",
    type: "list_items",
    page_path: "/",
    layout_style: "default",
    is_visible: true,
    display_order: 3,
    portfolio_items: buildItems("home-tools", config.tools),
  },

  // --- SHOWCASE PAGE (/showcase) ---
  {
    id: "showcase-deep",
    title: "Deep Dives",
    type: "list_items",
    page_path: "/showcase",
    layout_style: "grid-2-col",
    is_visible: true,
    display_order: 1,
    portfolio_items: buildItems("showcase-deep", config.showcase),
  },

  // --- ABOUT PAGE (/about) ---
  {
    id: "about-edu",
    title: "Education",
    type: "list_items",
    page_path: "/about",
    layout_style: "timeline",
    is_visible: true,
    display_order: 1,
    portfolio_items: buildItems(
      "about-edu",
      config.education.map((e) => ({
        title: e.title,
        institution: e.institution,
        from: e.from,
        to: e.to,
        description: e.description,
      })),
    ),
  },
  {
    id: "about-exp",
    title: "Experience",
    type: "list_items",
    page_path: "/about",
    layout_style: "timeline",
    is_visible: true,
    display_order: 2,
    portfolio_items: buildItems(
      "about-exp",
      config.experience.map((e) => ({
        title: e.title,
        company: e.company,
        from: e.from,
        to: e.to,
        description: e.description,
        tags: e.tags,
      })),
    ),
  },

  // --- PROJECTS PAGE (/projects) ---
  {
    id: "projects-featured",
    title: "Featured Projects",
    type: "list_items",
    page_path: "/projects",
    layout_style: "feature-alternating",
    is_visible: true,
    display_order: 1,
    portfolio_items: buildItems(
      "projects-featured",
      config.projects.map((p) => ({
        title: p.title,
        subtitle: p.subtitle,
        description: p.description,
        tags: p.tags,
        link: p.link,
        image: p.image,
      })),
    ),
  },

  // --- CONTACT PAGE (/contact) ---
  {
    id: "contact-services",
    title: "Services",
    type: "list_items",
    page_path: "/contact",
    layout_style: "default",
    is_visible: true,
    display_order: 1,
    portfolio_items: buildItems(
      "contact-services",
      config.services.map((s) => ({
        title: s.title,
        subtitle: s.subtitle,
        description: s.description,
        tags: s.tags,
      })),
    ),
  },
];
