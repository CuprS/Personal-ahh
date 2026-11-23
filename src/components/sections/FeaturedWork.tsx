import Link from "next/link";
import { ContributionCard } from "@/components/ContributionCard";
import { Section } from "@/components/Section";
import { getAllContributions } from "@/lib/content";

export function FeaturedWork() {
  const latest = getAllContributions().slice(0, 3);

  return (
    <Section
      id="work"
      eyebrow="Selected work"
      title={<>Recent <em>contributions</em></>}
      action={
        <Link
          href="/contributions"
          className="text-sm font-semibold underline-offset-4 hover:text-accent hover:underline"
        >
          All contributions →
        </Link>
      }
    >
      {latest.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((item) => (
            <ContributionCard key={item.slug} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-muted">Nothing here yet. Add an .mdx file to content/contributions.</p>
      )}
    </Section>
  );
}
