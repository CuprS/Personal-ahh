import { Section } from "@/components/Section";
import { site, type Idea } from "@/lib/site";

const statusLabel: Record<Idea["status"], string> = {
  exploring: "Exploring",
  building: "Building",
  someday: "Someday",
};

const statusDot: Record<Idea["status"], string> = {
  exploring: "bg-sky-500",
  building: "bg-emerald-500",
  someday: "bg-muted",
};

export function Ideas() {
  return (
    <Section id="ideas" eyebrow="Ideas" title={<>On my <em>mind</em></>}>
      <ul className="divide-y divide-border border-y border-border">
        {site.ideas.map((idea, i) => (
          <li
            key={idea.title}
            className="grid gap-2 py-6 sm:grid-cols-[4rem_1fr_auto] sm:items-baseline sm:gap-6"
          >
            <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="text-xl font-semibold tracking-tight">{idea.title}</h3>
              {idea.blurb ? <p className="mt-1 text-muted">{idea.blurb}</p> : null}
            </div>
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <span aria-hidden className={`size-2 rounded-full ${statusDot[idea.status]}`} />
              {statusLabel[idea.status]}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
