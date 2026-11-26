# Personal site

My home on the web for work, contributions, and creative ideas.

**Stack:** [Next.js 16](https://nextjs.org) (App Router) · [Tailwind CSS v4](https://tailwindcss.com) · MDX content · [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) for the side menu · [Resend](https://resend.com) for the contact form.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Scrollable landing page: Hero → About → Recent contributions → Ideas → **Contact** (at the bottom) |
| `/contributions` | Every contribution, newest first |
| `/contributions/[slug]` | A single contribution, written in MDX |
| `/try-now` | Placeholder for interactive demos (coming soon) |

The **side pull-out menu** (the "Menu" tab on the right edge) is on every page and links to Contributions and Try Now.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build (every page is prerendered to static HTML) |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Editing the site

### Your details

Everything personal (name, tagline, bio, focus areas, ideas, the inbox for the contact form, the background video) lives in **`src/lib/site.ts`**. Start there.

Colours are CSS variables at the top of **`src/app/globals.css`**: one dark "desert dusk" look, with a gradient from deep plum to burnt orange fixed behind every page.

### Background video (landing page)

A muted video loops behind the landing page at 35% opacity. It is centred on the hero's "Scroll" cue, scrolls with the page, and fades into the gradient at its top and bottom edges. Portrait screens (phones held upright) get a portrait crop; everything else gets a landscape crop.

The files live in `public/videos/` and are set in `src/lib/site.ts`:

```ts
backgroundVideo: {
  landscape: "/videos/bison-rider-landscape.mp4",
  portrait: "/videos/bison-rider-portrait.mp4",
  landscapePoster: "/videos/bison-rider-landscape.jpg",
  portraitPoster: "/videos/bison-rider-portrait.jpg",
  opacity: 0.35,
},
```

To swap the video, make a landscape and a portrait crop (MP4 / H.264, no audio, around 30 fps, a few MB each) and point to them; set `backgroundVideo: null` to turn it off. It pauses for visitors who have reduced motion turned on.

### Adding a contribution

Create a new file in `content/contributions/`. The file name becomes the URL:
`content/contributions/my-project.mdx` → `/contributions/my-project`.

```mdx
---
title: "My project"
date: 2026-11-01            # or just a year: 2019
endDate: 2027               # optional: shows a range, e.g. "2019–2021"
summary: "One or two sentences shown on the card."
tags: ["Next.js", "Open source"]
url: "https://my-project.com"          # optional: "Visit project" button
repo: "https://github.com/me/project"  # optional: "View code" button
links:                                 # optional: extra buttons
  - label: "Try it now"
    href: "/try-now"                   # a page on this site, or a full URL
youtube: "https://youtu.be/XXXXXXXXXXX" # optional: YouTube video below the text (unlisted is fine; "" = "Video coming soon" space)
backgroundAudio: "/audio/song.mp3"    # optional: soft looping music, starts on the first tap/click; visitors can turn it off
---

Write the rest in Markdown. **Bold**, lists, `code`, links, and images all work.

## Headings become section titles

![Screenshot](/images/my-project.png)
```

Put images in `public/` (for example `public/images/`) and reference them from `/`.
Contributions are listed newest first (a date range counts by its end). The newest three show up on the landing page automatically.
Delete the `example-*.mdx` files once you've added your own.

## Contact form

The form posts to a Next.js Server Action (`src/app/actions/contact.ts`). That action validates the input, drops spam caught by a hidden honeypot field, and emails you through Resend.

- **Local dev with no setup:** messages are printed in the terminal running `npm run dev`.
- **To get real emails:** copy `.env.example` to `.env.local` and set `RESEND_API_KEY`. Messages go to the `email` in `src/lib/site.ts` (never shown on the site; `CONTACT_TO_EMAIL` overrides it), and hitting Reply answers the visitor at the address they typed. The free Resend tier is plenty for a portfolio. To send from your own address, verify your domain in Resend and set `CONTACT_FROM_EMAIL`.

## Deploying (Vercel)

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com/new), import the repo. The defaults work.
3. Add the environment variables from `.env.example` in **Project → Settings → Environment Variables**.
4. Set `url` in `src/lib/site.ts` to your real domain so link previews work.

## Project structure

```
content/contributions/   MDX files, one per contribution
src/
  app/
    page.tsx             Landing page
    contributions/       List + [slug] detail pages
    try-now/             Coming-soon page
    actions/contact.ts   Contact form server action
  components/
    SideDrawer.tsx       Pull-out menu
    ContactForm.tsx      Contact form (client component)
    MdxContent.tsx       Styles for MDX content
    sections/            Landing page sections
  lib/
    site.ts              Your details: edit this first
    content.ts           Reads and validates the MDX files
```

## What's next

- **Try Now demos:** add each demo as a route under `src/app/try-now/<demo>/page.tsx` and link it from the Try Now page.
- **MongoDB (when needed):** content lives in files for now, so no database is required. When a feature needs to store data (saving contact messages, a guestbook, likes, demo data), add the `mongodb` driver with a small `src/lib/db.ts` connection helper and a free MongoDB Atlas cluster.
- Custom domain, analytics (e.g. Vercel Analytics), and an Open Graph image.
