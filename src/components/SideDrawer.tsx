"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const primaryLinks = [
  {
    href: "/contributions",
    label: "Contributions",
    description: "Projects, open-source work and things I've helped build.",
    index: "01",
  },
  {
    href: "/try-now",
    label: "Try Now",
    description: "Interactive demos and experiments you can play with.",
    index: "02",
  },
] as const;

const secondaryLinks = [
  { href: "/", label: "Home" },
  { href: "/#contact", label: "Contact" },
] as const;

/**
 * The pull-out menu. A tab is fixed to the right edge of every page;
 * clicking it slides a panel in from the right.
 * Radix Dialog handles focus trapping, Esc to close, and screen-reader labels.
 */
export function SideDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="group fixed top-4 right-0 z-40 flex flex-col xl:top-1/2 xl:-translate-y-1/2 items-center gap-3 rounded-l-2xl border border-r-0 border-border bg-surface/90 px-2.5 py-5 text-foreground shadow-lg backdrop-blur transition-[padding,background-color] hover:bg-surface hover:pr-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label="Open menu"
        >
          <span aria-hidden className="flex flex-col gap-1">
            <span className="block h-0.5 w-4 rounded bg-current" />
            <span className="block h-0.5 w-4 rounded bg-accent transition-[width] group-hover:w-2.5" />
            <span className="block h-0.5 w-4 rounded bg-current" />
          </span>
          <span className="text-xs font-semibold tracking-[0.2em] uppercase [writing-mode:vertical-rl]">
            Menu
          </span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="drawer-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="drawer-panel fixed top-0 right-0 z-50 flex h-dvh w-[min(24rem,88vw)] flex-col border-l border-border bg-surface shadow-2xl focus:outline-none">
          <DrawerBody onNavigate={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Only mounted while the drawer is open, so usePathname never runs during prerendering. */
function DrawerBody({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <Dialog.Title className="font-display text-2xl italic">Explore</Dialog.Title>
        <Dialog.Description className="sr-only">
          Jump to Contributions or Try Now, or head back home.
        </Dialog.Description>
        <Dialog.Close asChild>
          <button
            type="button"
            aria-label="Close menu"
            className="-mr-2 rounded-full p-2 text-muted transition-colors hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </Dialog.Close>
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
        {primaryLinks.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`group rounded-2xl border p-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                active
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent hover:bg-background"
              }`}
            >
              <span className="font-mono text-xs text-muted">{link.index}</span>
              <span className="mt-1 flex items-center justify-between gap-3">
                <span className="text-2xl font-semibold tracking-tight">{link.label}</span>
                <span
                  aria-hidden
                  className="text-xl text-accent transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-muted">
                {link.description}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="flex gap-6 border-t border-border px-6 py-5 text-sm">
        {secondaryLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className="text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </>
  );
}
