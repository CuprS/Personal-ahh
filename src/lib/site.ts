/**
 * Everything personal about the site lives here.
 * Edit this file to change your name, bio, ideas and contact links.
 */

export type Idea = {
  title: string;
  blurb: string;
  status: "exploring" | "building" | "someday";
};

export type SocialLink = {
  label: string;
  href: string;
};

export const site = {
  name: "Your Name",
  role: "Developer & creative tinkerer",
  tagline: "I build things for the web and chase ideas until they turn into something real.",
  description:
    "Portfolio of work, contributions and creative experiments. Replace this with a one-line description of yourself.",
  // Used for absolute URLs in social previews. Set to your real domain once deployed.
  url: "https://example.com",

  about: [
    "This is the About section. Write two or three short paragraphs about who you are, what you like making, and what you're looking for.",
    "Keep it human. Mention the tools you reach for, the problems you enjoy, and anything that makes your work yours.",
  ],
  focus: ["Web apps", "Creative coding", "Open source", "UI & interaction design"],

  ideas: [
    {
      title: "An idea you're exploring",
      blurb: "One sentence on what it is and why it excites you.",
      status: "exploring",
    },
    {
      title: "Something you're building",
      blurb: "A work-in-progress you want people to know about.",
      status: "building",
    },
    {
      title: "A someday project",
      blurb: "The ambitious one. Writing it down here keeps it alive.",
      status: "someday",
    },
  ] satisfies Idea[],

  email: "you@example.com",
  socials: [
    { label: "GitHub", href: "https://github.com/CuprS" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
  ] satisfies SocialLink[],
};
