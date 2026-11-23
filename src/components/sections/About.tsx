import { Section } from "@/components/Section";
import { site } from "@/lib/site";

export function About() {
  return (
    <Section id="about" eyebrow="About" title={<>A bit about <em>me</em></>}>
      <div className="grid gap-10 md:grid-cols-[2fr_1fr] md:gap-16">
        <div className="space-y-5 text-lg leading-relaxed">
          {site.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted">What I work on</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {site.focus.map((item) => (
              <li
                key={item}
                className="rounded-full border border-border bg-surface px-4 py-2 text-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
