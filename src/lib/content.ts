import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/**
 * Contributions are MDX files in /content/contributions.
 * The file name (minus .mdx) becomes the URL slug: my-project.mdx -> /contributions/my-project
 *
 * Reads are synchronous on purpose: the content is fixed at build time,
 * so every contribution page is prerendered as static HTML.
 */

const CONTRIBUTIONS_DIR = path.join(process.cwd(), "content", "contributions");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const frontmatterSchema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
  summary: z.string().min(1),
  tags: z.array(z.string()).default([]),
  url: z.url().optional(),
  repo: z.url().optional(),
});

export type ContributionMeta = {
  slug: string;
  title: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  summary: string;
  tags: string[];
  url?: string;
  repo?: string;
};

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

  const { date, ...rest } = parsed.data;
  return {
    meta: { slug, ...rest, date: date.toISOString().slice(0, 10) },
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
