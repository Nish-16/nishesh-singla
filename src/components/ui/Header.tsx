"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { identity, nav, sections } from "@/content";
import { useTerminal } from "./Terminal";
import ThemeToggle from "./ThemeToggle";
import { useReducedMotion } from "@/lib/hooks";

const NAV = sections.filter((s) => s.nav);

export default function Header() {
  const { toggle } = useTerminal();
  const reduced = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);

  // Scroll-spy: highlight the link of the section in the middle of the viewport.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const id of ["top", ...sections.map((s) => s.id)]) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 md:pl-20">
        <a href="#top" className="flex shrink-0 items-center gap-2 font-display text-base font-semibold tracking-tight text-ink">
          <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
          <span className="hidden sm:inline">{identity.name}</span>
          <span className="sm:hidden">{identity.firstName}</span>
        </a>

        <nav aria-label={nav.primary} className="flex min-w-0 items-center gap-1 sm:gap-3">
          <ul className="flex items-center gap-0.5 overflow-x-auto sm:gap-1">
            {NAV.map((s) => {
              const on = active === s.id;
              return (
                <li key={s.id} className="relative">
                  <a
                    href={`#${s.id}`}
                    aria-current={on ? "location" : undefined}
                    className={`relative block rounded-md px-2 py-1.5 font-mono text-[12px] transition-colors sm:px-3 sm:text-[13px] ${
                      on ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {on && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-md border border-line bg-surface-2"
                        transition={{ duration: reduced ? 0 : 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                      />
                    )}
                    {s.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={toggle}
            aria-label={nav.terminal}
            className="hidden items-center gap-2 rounded-md border border-line bg-surface/80 px-2.5 py-1.5 font-mono text-[12px] text-ink transition-colors hover:border-accent/60 md:flex"
          >
            <kbd className="rounded bg-surface-2 px-1.5 text-accent">`</kbd>
            {nav.terminal}
          </button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
