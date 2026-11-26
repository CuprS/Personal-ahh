import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { youtubeId } from "@/lib/youtube";

/**
 * Contributions are MDX files in /content/contributions.
 * The file name (minus .mdx) becomes the URL slug: my-project.mdx -> /contributions/my-project
 *
 * Reads are synchronous on purpose: the content is fixed at build time,
 * so every contribution page is prerendered as static HTML.
 */

const CONTRIBUTIONS_DIR = path.join(process.cwd(), "content", "contributions");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const dateValue = z.union([z.date(), z.string(), z.number()]);

const frontmatterSchema = z.object({
  title: z.string().min(1),
  // A full date (2026-10-14) or just a year (2019).
  date: dateValue,
  // Optional end of a date range, e.g. date: 2019 and endDate: 2021 shows "2019–2021".
  endDate: dateValue.optional(),
  summary: z.string().min(1),
  tags: z.array(z.string()).default([]),
  url: z.url().optional(),
  repo: z.url().optional(),
  // Extra buttons: a page on this site ("/try-now") or a full URL.
  links: z
    .array(
      z.object({
        label: z.string().min(1),
        href: z.string().refine((h) => h.startsWith("/") || URL.canParse(h), "Use a path like /try-now or a full URL"),
      }),
    )
    .default([]),
  // A YouTube video for the page (an unlisted video works): its link or ID, or "" for an
  // empty "Video coming soon" space to fill in later.
  youtube: z.string().optional(),
  // Soft looping background music for the page: a path in /public ("/audio/song.mp3").
  backgroundAudio: z.string().startsWith("/", "Use a path in /public, like /audio/song.mp3").optional(),
});

export type ContributionMeta = {
  slug: string;
  title: string;
  /** ISO date, YYYY-MM-DD (January 1 for year-only dates). Used for sorting. */
  date: string;
  /** Value for <time dateTime>: the ISO date, or just the year. */
  dateTime: string;
  /** What visitors see: "October 2026", "2019", or a range like "2019–2021". */
  dateLabel: string;
  summary: string;
  tags: string[];
  url?: string;
  repo?: string;
  links: { label: string; href: string }[];
  /** YouTube video ID, "" for an empty video space, or undefined for no video section. */
  youtube?: string;
  /** Background music path, played softly while the page is open. */
  backgroundAudio?: string;
};

/** Turn a frontmatter date (full date or year) into sortable and display forms. */
function readDate(value: Date | string | number, slug: string) {
  const year = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  if (/^\d{4}$/.test(year)) {
    return { date: `${year}-01-01`, dateTime: year, dateLabel: year };
  }
  const parsed = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date "${String(value)}" in content/contributions/${slug}.mdx`);
  }
  const iso = parsed.toISOString().slice(0, 10);
  return { date: iso, dateTime: iso, dateLabel: formatDate(iso) };
}

export type Contribution = {
  meta: ContributionMeta;
  body: string;
};

function readContribution(slug: string): Contribution {
  const filePath = path.join(CONTRIBUTIONS_DIR, `${slug}.mdx`);
  const { data, content } = matter(fs.readFileSync(filePath, "utf8"));

  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in content/contributions/${slug}.mdx:\n${z.prettifyError(parsed.error)}`,
    );
  }

  const { date, endDate, youtube, ...rest } = parsed.data;
  let youtubeVideo: string | undefined;
  if (youtube !== undefined) {
    youtubeVideo = youtube.trim() === "" ? "" : youtubeId(youtube) ?? undefined;
    if (youtubeVideo === undefined) {
      throw new Error(`Couldn't read the YouTube link "${youtube}" in content/contributions/${slug}.mdx`);
    }
  }
  const start = readDate(date, slug);
  // A range sorts by its end (its most recent activity) and shows "start–end".
  const dates = endDate
    ? (() => {
        const end = readDate(endDate, slug);
        return { date: end.date, dateTime: start.dateTime, dateLabel: `${start.dateLabel}–${end.dateLabel}` };
      })()
    : start;
  return {
    meta: { slug, ...rest, ...dates, youtube: youtubeVideo },
    body: content,
  };
}

export function getContributionSlugs(): string[] {
  if (!fs.existsSync(CONTRIBUTIONS_DIR)) return [];
  return fs
    .readdirSync(CONTRIBUTIONS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.slice(0, -".mdx".length))
    .filter((slug) => SLUG_PATTERN.test(slug));
}

/** All contributions, newest first. */
export function getAllContributions(): ContributionMeta[] {
  return getContributionSlugs()
    .map((slug) => readContribution(slug).meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** One contribution with its MDX body, or null if the slug doesn't exist. */
export function getContribution(slug: string): Contribution | null {
  if (!getContributionSlugs().includes(slug)) return null;
  return readContribution(slug);
}

export function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}
