import Link from "next/link";
import { formatDate, type ContributionMeta } from "@/lib/content";

export function ContributionCard({ item }: { item: ContributionMeta }) {
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-[border-color,transform,box-shadow] hover:-translate-y-1 hover:border-accent hover:shadow-xl hover:shadow-accent/5">
      <time dateTime={item.date} className="font-mono text-xs text-muted">
        {formatDate(item.date)}
      </time>
      <h3 className="mt-3 text-xl font-semibold tracking-tight">
        <Link
          href={`/contributions/${item.slug}`}
          prefetch
          className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none group-has-[:focus-visible]:underline"
        >
          {item.title}
        </Link>
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{item.summary}</p>
      {item.tags.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tags">
          {item.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
      <span
        aria-hidden
        className="absolute top-6 right-6 text-lg text-accent opacity-0 transition-[opacity,transform] group-hover:translate-x-1 group-hover:opacity-100"
      >
        →
      </span>
    </article>
  );
}
