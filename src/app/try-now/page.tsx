import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Try Now",
  description: "Interactive demos and experiments. Coming soon.",
};

export default function TryNowPage() {
  return (
    <>
      <PageIntro eyebrow="02 · Try Now" title={<>Things you can <em>play with</em></>}>
        <p>Interactive demos and experiments will live here.</p>
      </PageIntro>

      <div className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8">
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-surface/50 px-6 py-20 text-center">
          <span aria-hidden className="font-display text-6xl text-accent italic">
            soon
          </span>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight">Nothing to try yet</h2>
          <p className="mt-3 max-w-md text-muted">
            I&apos;m cooking up demos for this page. Check out my contributions in the meantime.
          </p>
          <Link
            href="/contributions"
            className="mt-8 rounded-full bg-foreground px-6 py-3 font-semibold text-background transition-transform hover:-translate-y-0.5"
          >
            See contributions
          </Link>
        </div>
      </div>
    </>
  );
}
