"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { identity, nav, pages } from "@/content";
import { useTerminal } from "./Terminal";
import { useReducedMotion } from "@/lib/hooks";

export default function Header() {
  const { toggle } = useTerminal();
  const pathname = usePathname();
  const reduced = useReducedMotion();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-board/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 md:pl-20">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-base font-semibold tracking-tight text-ink">
          <span aria-hidden className="h-2 w-2 rounded-full bg-signal shadow-[0_0_8px_#3DF5C4]" />
          <span className="hidden sm:inline">{identity.name}</span>
          <span className="sm:hidden">{identity.firstName}</span>
        </Link>

        <nav aria-label={nav.primary} className="flex min-w-0 items-center gap-1 sm:gap-3">
          <ul className="flex items-center gap-0.5 sm:gap-1">
            {pages.map((p) => {
              const active = p.href === "/" ? pathname === "/" : pathname.startsWith(p.href);
              return (
                <li key={p.href} className="relative">
                  <Link
                    href={p.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative block rounded-md px-2 py-1.5 font-mono text-[12px] transition-colors sm:px-3 sm:text-[13px] ${
                      active ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-tab"
                        className="absolute inset-0 -z-10 rounded-md border border-signal/40 bg-signal/10"
                        transition={{ duration: reduced ? 0 : 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                      />
                    )}
                    {p.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={toggle}
            aria-label={nav.terminal}
            className="hidden items-center gap-2 rounded-md border border-line bg-surface/80 px-2.5 py-1.5 font-mono text-[12px] text-ink transition-colors hover:border-signal/60 md:flex"
          >
            <kbd className="rounded bg-surface-2 px-1.5 text-signal">`</kbd>
            {nav.terminal}
          </button>
        </nav>
      </div>
    </header>
  );
}
