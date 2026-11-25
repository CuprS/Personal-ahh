/**
 * Shared wrapper so every landing-page section has the same width, spacing and heading style.
 * Without a `title`, the small eyebrow label becomes the section's heading.
 */
export function Section({
  id,
  eyebrow,
  title,
  action,
  children,
}: {
  id: string;
  eyebrow: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const eyebrowClass = "font-mono text-xs tracking-[0.2em] text-accent uppercase";
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-8 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 sm:mb-14">
          {title ? (
            <div>
              <p className={eyebrowClass}>{eyebrow}</p>
              <h2
                id={`${id}-title`}
                className="mt-3 font-display text-4xl leading-tight sm:text-5xl"
              >
                {title}
              </h2>
            </div>
          ) : (
            <h2 id={`${id}-title`} className={eyebrowClass}>
              {eyebrow}
            </h2>
          )}
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}
