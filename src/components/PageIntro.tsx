/** Title block used at the top of the inner pages (Contributions, Try Now, ...). */
export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-32 pb-12 sm:px-8 sm:pt-40 sm:pb-16">
      <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
      <h1 className="mt-4 font-display text-5xl leading-[1.05] sm:text-7xl">{title}</h1>
      {children ? (
        <div className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{children}</div>
      ) : null}
    </div>
  );
}
