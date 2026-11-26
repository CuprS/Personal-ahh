/**
 * Everything personal about the site lives here.
 * Edit this file to change your name, bio, ideas and contact links.
 */

export type Idea = {
  title: string;
  /** Optional one-line description shown under the title. */
  blurb?: string;
  status: "exploring" | "building" | "someday";
};

export type BackgroundVideoConfig = {
  /** Landscape crop for desktops, laptops and phones held sideways (path in /public). */
  landscape: string;
  /** Portrait crop for phones held upright (path in /public). Falls back to `landscape`. */
  portrait?: string;
  /** Still images shown while each video loads. */
  landscapePoster?: string;
  portraitPoster?: string;
  /** 0 to 1. The gradient shows through the rest. */
  opacity?: number;
};

export const site = {
  name: "Cooper Stone",
  role: "Communications & Tech Consultant",
  tagline: "Creating the future of software, hardware, and communications.",
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
    {
      title: "Non-static code for cybersecurity",
      status: "someday",
    },
  ] satisfies Idea[],

  // The single button under the headline. Blank for now; give it a label (and a link) later,
  // e.g. { label: "See my work", href: "/contributions" }.
  heroButton: { label: "", href: "" },

  // Where contact form messages are delivered (not shown on the site).
  // CONTACT_TO_EMAIL in the environment overrides it.
  email: "copperstone@outlook.com",

  // Looping video behind the landing page, centred on the "Scroll" cue and scrolling past
  // to reveal the gradient. Set to null to turn it off. Keep files short and small
  // (MP4 / H.264 plays on every device).
  backgroundVideo: {
    landscape: "/videos/bison-rider-landscape.mp4",
    portrait: "/videos/bison-rider-portrait.mp4",
    landscapePoster: "/videos/bison-rider-landscape.jpg",
    portraitPoster: "/videos/bison-rider-portrait.jpg",
    opacity: 0.35,
  } as BackgroundVideoConfig | null,
};
