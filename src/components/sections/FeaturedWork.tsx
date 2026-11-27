import Link from "next/link";
import { ContributionCard } from "@/components/ContributionCard";
import { Section } from "@/components/Section";
import { getAllContributions, type ContributionMeta } from "@/lib/content";
import { site } from "@/lib/site";

/** The boxes listed in site.featuredWork: named contributions where given, the newest others elsewhere. */
function featuredContributions(): ContributionMeta[] {
  const all = getAllContributions();
  const named = new Set(site.featuredWork.filter((slot) => slot !== "latest"));
  const newestOthers = all.filter((item) => !named.has(item.slug));
  return site.featuredWork.flatMap((slot) => {
    if (slot === "latest") {
      const next = newestOthers.shift();
      return next ? [next] : [];
    }
    const item = all.find((c) => c.slug === slot);
    if (!item) throw new Error(`site.featuredWork lists "${slot}", but content/contributions/${slot}.mdx doesn't exist`);
    return [item];
  });
}

export function FeaturedWork() {
  const featured = featuredContributions();

  return (
    <Section
      id="work"
      eyebrow="Selected work"
      action={
        <Link
          href="/contributions"
          className="text-sm font-semibold underline-offset-4 hover:text-accent hover:underline"
        >
          All contributions →
        </Link>
      }
    >
      {featured.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((item) => (
            <ContributionCard key={item.slug} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-muted">Nothing here yet. Add an .mdx file to content/contributions.</p>
      )}
    </Section>
  );
}
