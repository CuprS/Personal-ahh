import { ContactForm } from "@/components/ContactForm";
import { Section } from "@/components/Section";
import { site } from "@/lib/site";

export function ContactSection() {
  return (
    <Section id="contact" eyebrow="Contact" title={<>Let&apos;s make something <em>together</em></>}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div>
          <p className="text-lg leading-relaxed text-muted">
            Have a project, a question, or an idea you want to bounce around? Send a message, or
            find me on any of these.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            <li>
              <a
                href={`mailto:${site.email}`}
                className="group flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-accent"
              >
                <span>
                  <span className="block text-xs text-muted">Email</span>
                  <span className="font-medium">{site.email}</span>
                </span>
                <span aria-hidden className="text-accent transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
            </li>
            {site.socials.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-accent"
                >
                  <span className="font-medium">{social.label}</span>
                  <span aria-hidden className="text-accent transition-transform group-hover:translate-x-1">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}
