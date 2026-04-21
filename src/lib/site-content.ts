import portfolioConfig from "../../portfolio.config";

// Some content might remain static if not managed by the CMS
export const siteContent = {
  experience: {
    mainTitle: "Experience",
    mainSubtitle: "CAREER",
  },
  pages: {
    about: {
      title: "About Me",
      description:
        `Learn more about ${portfolioConfig.name}, the developer behind the code.`,
      heading: "[ ABOUT_ME ]",
      bio: [
        "I'm a full-stack developer specializing in building robust and scalable web applications. My passion lies at the intersection of clean architecture, efficient code, and intuitive user experiences.",
        "I thrive on solving complex problems and am constantly exploring new technologies to enhance my toolkit. I am a strong advocate for open-source and contribute to projects whenever I can.",
      ],
    },
    contact: {
      title: "Contact Me",
      description:
        `Let's build something great together. Get in touch with ${portfolioConfig.name}.`,
      heading: "Get In Touch",
      subheading:
        "Have a project in mind or just want to say hello? I'd love to hear from you.",
      servicesTitle: "What I Can Do For You",
    },
    projects: {
      title: "My Projects",
      description:
        `A collection of projects developed by ${portfolioConfig.name}, showcasing skills in various technologies.`,
      heading: "Projects",
    },
    showcase: {
      title: "Showcase",
      description:
        "A curated collection of my work, skills, and professional journey.",
      heading: "Showcase",
      subheading:
        "A deep dive into my professional journey, featured projects, and technical expertise.",
    },
    blog: {
      title: "The Blog",
      description:
        "A collection of articles on web development, design, and technology.",
    },
  },
  hero: {
    statusPanel: {
      latestProject: {
        title: "Latest Project",
        name: "Portfolio Redesign",
        linkText: "See all projects",
        href: "/projects",
      },
    },
  },
};
