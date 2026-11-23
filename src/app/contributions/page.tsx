import type { Metadata } from "next";
import { ContributionCard } from "@/components/ContributionCard";
import { PageIntro } from "@/components/PageIntro";
import { getAllContributions } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contributions",
  description: "Projects, open-source work and things I've helped build.",
};

export default function ContributionsPage() {
  const contributions = getAllContributions();

  return (
    <>
      <PageIntro eyebrow="01 · Contributions" title={<>Things I&apos;ve <em>built</em></>}>
        <p>Projects, open-source work, and creative pieces, newest first.</p>
      </PageIntro>

      <div className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8">
        {contributions.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {contributions.map((item) => (
              <ContributionCard key={item.slug} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-muted">
            Nothing here yet. Add an <code>.mdx</code> file to <code>content/contributions</code>.
          </p>
        )}
      </div>
    </>
  );
}
