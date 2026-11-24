import Link from "next/link";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-svh items-center overflow-hidden">
      {/* Decorative background: soft accent glow + faint grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-[-10%] size-[38rem] rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] size-[28rem] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:64px_64px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pt-28 pb-24 sm:px-8">
        <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{site.role}</p>
        <h1 className="mt-6 max-w-4xl font-display text-6xl leading-[0.95] sm:text-8xl lg:text-9xl">
          Work, ideas <span className="italic text-accent">&amp;</span> experiments.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">{site.tagline}</p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/contributions"
            className="rounded-full bg-foreground px-6 py-3 font-semibold text-background transition-transform hover:-translate-y-0.5"
          >
            See my work
          </Link>
          <Link
            href="#contact"
            className="rounded-full border border-border bg-surface/60 px-6 py-3 font-semibold backdrop-blur transition-[border-color,transform] hover:-translate-y-0.5 hover:border-accent"
          >
            Get in touch
          </Link>
        </div>
      </div>

      <a
        href="#about"
        data-scroll-cue
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs tracking-[0.2em] text-muted uppercase transition-colors hover:text-foreground"
      >
        Scroll
        <span aria-hidden className="block h-10 w-px animate-pulse bg-current" />
      </a>
    </section>
  );
}
