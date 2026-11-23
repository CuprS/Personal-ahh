import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MdxContent } from "@/components/MdxContent";
import { formatDate, getContribution, getContributionSlugs } from "@/lib/content";

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
        <time dateTime={meta.date} className="font-mono text-xs text-muted">
          {formatDate(meta.date)}
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

        {meta.url || meta.repo ? (
          <div className="mt-8 flex flex-wrap gap-3">
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
    </>
  );
}
