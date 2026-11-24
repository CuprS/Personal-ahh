/**
 * Everything personal about the site lives here.
 * Edit this file to change your name, bio, ideas and contact links.
 */

export type Idea = {
  title: string;
  blurb: string;
  status: "exploring" | "building" | "someday";
};

export type BackgroundVideoConfig = {
  /** Path of a file in /public, e.g. "/background.mp4". */
  src: string;
  /** e.g. "video/mp4" or "video/webm". */
  type?: string;
  /** Optional still image shown while the video loads. */
  poster?: string;
};

export const site = {
  name: "Cooper Stone",
  role: "Communications & Tech Consultant",
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

  // Where contact form messages are delivered (not shown on the site).
  // CONTACT_TO_EMAIL in the environment overrides it.
  email: "copperstone@outlook.com",

  // Short looping video that plays behind the landing page (muted, starts on its own).
  // Put the file in /public and point to it, for example:
  //   backgroundVideo: { src: "/background.mp4", type: "video/mp4" },
  // Keep it short (5–15 s) and small (under ~5 MB). MP4 (H.264) plays on every device.
  backgroundVideo: null as BackgroundVideoConfig | null,
};
