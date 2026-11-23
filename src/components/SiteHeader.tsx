import Link from "next/link";
import { site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center px-4 py-5 sm:px-8">
        <Link
          href="/"
          className="font-display text-2xl italic transition-colors hover:text-accent"
        >
          {site.name}
          <span className="text-accent">.</span>
        </Link>
      </div>
    </header>
  );
}
