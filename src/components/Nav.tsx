"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { OPEN_PALETTE_EVENT } from "@/components/CommandPalette";

const LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#projects", label: "Projects" },
  { href: "/#journey", label: "Journey" },
  { href: "/updates", label: "Updates" },
  { href: "/writing", label: "Writing" },
  { href: "/playground", label: "Playground" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    !href.startsWith("/#") && pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/75 backdrop-blur-xl">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5"
      >
        <Link
          href="/"
          className="font-mono text-sm font-medium tracking-tight"
          onClick={() => setOpen(false)}
        >
          roshan<span className="text-accent-soft">.</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-sm transition-colors hover:text-ink ${
                  isActive(l.href) ? "bg-surface-hover text-ink" : "text-ink2"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener"
              className="ml-2 rounded-full border border-line-strong px-3.5 py-2 text-sm hover:bg-surface-hover"
            >
              Resume
            </a>
          </li>
        </ul>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
          aria-label="Open command palette"
          className="ml-auto mr-2 flex h-11 items-center gap-2 rounded-full border border-line px-3.5 font-mono text-xs text-ink2 hover:text-ink md:order-last md:ml-2 md:mr-0 md:h-9"
        >
          <span aria-hidden="true">⌕</span>
          <kbd className="hidden sm:inline">Ctrl K</kbd>
        </button>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            {open ? (
              <path
                d="M4 4l10 10M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M2.5 5h13M2.5 9h13M2.5 13h13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <ul
          id="mobile-menu"
          className="border-t border-line bg-bg/95 px-5 py-3 md:hidden"
        >
          {[...LINKS, { href: "/resume.pdf", label: "Resume" }].map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center text-base text-ink2 hover:text-ink"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
