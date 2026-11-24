import { ContactForm } from "@/components/ContactForm";
import { Section } from "@/components/Section";

export function ContactSection() {
  return (
    <Section id="contact" eyebrow="Contact" title={<>Let&apos;s make something <em>together</em></>}>
      <div className="max-w-2xl rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <ContactForm />
      </div>
    </Section>
  );
}
