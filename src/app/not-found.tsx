import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start justify-center px-4 py-40 sm:px-8">
      <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">404</p>
      <h1 className="mt-4 font-display text-5xl sm:text-7xl">
        This page wandered <em>off</em>.
      </h1>
      <p className="mt-6 text-lg text-muted">It might have moved, or it never existed.</p>
      <Link
        href="/"
        className="mt-10 rounded-full bg-foreground px-6 py-3 font-semibold text-background transition-transform hover:-translate-y-0.5"
      >
        Back home
      </Link>
    </div>
  );
}
