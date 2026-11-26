import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MdxContent } from "@/components/MdxContent";
import { getContribution, getContributionSlugs } from "@/lib/content";

// Every contribution page is fully prerendered at build time.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return getContributionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/contributions/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const contribution = getContribution(slug);
  if (!contribution) return {};
  return {
    title: contribution.meta.title,
    description: contribution.meta.summary,
  };
}

export default function ContributionPage({ params }: PageProps<"/contributions/[slug]">) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 pt-32 pb-24 sm:px-8 sm:pt-40">
      <Link
        href="/contributions"
        className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
      >
        ← All contributions
      </Link>

      {/* The slug-specific part sits behind Suspense so the page frame can be shared and prefetched. */}
      <Suspense fallback={<ContributionSkeleton />}>
        <ContributionBody params={params} />
      </Suspense>
    </article>
  );
}

function ContributionSkeleton() {
  return (
    <div aria-hidden className="mt-8 animate-pulse space-y-5">
      <div className="h-3 w-24 rounded bg-border" />
      <div className="h-12 w-3/4 rounded bg-border" />
      <div className="h-5 w-full rounded bg-border" />
      <div className="h-5 w-2/3 rounded bg-border" />
    </div>
  );
}

async function ContributionBody({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const contribution = getContribution(slug);
  if (!contribution) notFound();

  const { meta, body } = contribution;

  return (
    <>
      <header className="mt-8 border-b border-border pb-10">
        <time dateTime={meta.dateTime} className="font-mono text-xs text-muted">
          {meta.dateLabel}
        </time>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-6xl">{meta.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">{meta.summary}</p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {meta.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-muted">
              {tag}
            </span>
          ))}
        </div>

        {meta.url || meta.repo || meta.links.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {meta.links.map((link) =>
              link.href.startsWith("/") ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
                >
                  {link.label} →
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
                >
                  {link.label} ↗
                </a>
              ),
            )}
            {meta.url ? (
              <a
                href={meta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
              >
                Visit project ↗
              </a>
            ) : null}
            {meta.repo ? (
              <a
                href={meta.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-accent"
              >
                View code ↗
              </a>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="text-lg">
        <MdxContent source={body} />
      </div>

      {meta.youtube !== undefined ? <YouTubeVideo id={meta.youtube} title={meta.title} /> : null}
    </>
  );
}

/**
 * The page's YouTube video (unlisted videos work), played through YouTube's privacy-enhanced
 * embed, or an empty 16:9 space while `youtube: ""` in the frontmatter.
 */
function YouTubeVideo({ id, title }: { id: string; title: string }) {
  return (
    <section aria-label="Video" className="mt-12">
      {id ? (
        <>
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-surface">
            <iframe
              data-youtube-embed
              src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
              title={`${title} video`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="size-full"
            />
          </div>
          <a
            data-youtube-link
            href={`https://www.youtube.com/watch?v=${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            Watch on YouTube ↗
          </a>
        </>
      ) : (
        <div
          data-video-placeholder
          className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/60 text-muted"
        >
          <svg aria-hidden viewBox="0 0 28 20" className="h-10 w-14 text-accent">
            <rect width="28" height="20" rx="6" fill="currentColor" />
            <path d="M11.5 6v8l7-4z" fill="var(--surface)" />
          </svg>
          <p className="text-sm">Video coming soon</p>
        </div>
      )}
    </section>
  );
}
