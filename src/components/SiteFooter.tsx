import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          © {site.name}. Built with Next.js &amp; Tailwind.
        </p>
        <Link href="/#contact" className="underline-offset-4 hover:text-foreground hover:underline">
          Get in touch
        </Link>
      </div>
    </footer>
  );
}
