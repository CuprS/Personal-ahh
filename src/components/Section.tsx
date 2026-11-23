/** Shared wrapper so every landing-page section has the same width, spacing and heading style. */
export function Section({
  id,
  eyebrow,
  title,
  action,
  children,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-8 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 sm:mb-14">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
            <h2
              id={`${id}-title`}
              className="mt-3 font-display text-4xl leading-tight sm:text-5xl"
            >
              {title}
            </h2>
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}
