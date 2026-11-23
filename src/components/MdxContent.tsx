import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Styles for everything you can write in a contribution's MDX body.
 * Tweak these to change how all contribution pages look.
 */
const components = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mt-12 mb-4 font-display text-3xl sm:text-4xl" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-8 mb-3 text-xl font-semibold tracking-tight" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => <p className="my-5 leading-relaxed" {...props} />,
  a: ({ href = "", ...props }: ComponentPropsWithoutRef<"a">) => {
    const className = "font-medium text-accent underline underline-offset-4 hover:no-underline";
    return href.startsWith("/") || href.startsWith("#") ? (
      <Link href={href} className={className} {...props} />
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...props} />
    );
  },
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="my-5 list-disc space-y-2 pl-6 marker:text-accent" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="my-5 list-decimal space-y-2 pl-6 marker:text-muted" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li className="pl-1 leading-relaxed" {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="my-6 border-l-2 border-accent pl-5 text-muted italic" {...props} />
  ),
  hr: () => <hr className="my-10 border-border" />,
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="my-6 overflow-x-auto rounded-xl border border-border bg-surface p-4 font-mono text-sm leading-relaxed [&>code]:bg-transparent [&>code]:p-0"
      {...props}
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.9em]" {...props} />
  ),
  img: ({ alt = "", ...props }: ComponentPropsWithoutRef<"img">) => (
    // Plain <img> keeps MDX images simple; switch to next/image if you need resizing.
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} className="my-8 w-full rounded-2xl border border-border" {...props} />
  ),
};

export function MdxContent({ source }: { source: string }) {
  return <MDXRemote source={source} components={components} />;
}
