"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { sections } from "@/content";

/**
 * Fixed rail down the left edge: fills with scroll progress, with a node per section on the current page.
 * A node lights up (and stays lit) once its section enters the viewport.
 */
export default function ScrollRail() {
  const pathname = usePathname();
  const pageSections = sections.filter((s) => s.page === pathname);
  const fillRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [lit, setLit] = useState<{ path: string; ids: Set<string> }>({ path: pathname, ids: new Set() });
  const [active, setActive] = useState<string | null>(null);
  const litIds = lit.path === pathname ? lit.ids : new Set<string>();

  // Scroll progress → fill height (direct style writes, no re-render).
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
      if (headRef.current) headRef.current.style.top = `${p * 100}%`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  // Node positions (where the fill is when the section reaches mid-viewport) + light-up observers.
  useEffect(() => {
    const ids = sections.filter((s) => s.page === pathname).map((s) => s.id);
    let raf = 0;
    const measure = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const next: Record<string, number> = {};
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        next[id] = Math.min(0.97, Math.max(0.03, (top - window.innerHeight * 0.5) / max));
      }
      setPositions(next);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);

    const enter = new IntersectionObserver(
      (entries) => {
        const newly = entries.filter((e) => e.isIntersecting).map((e) => e.target.id);
        if (newly.length)
          setLit((prev) => ({ path: pathname, ids: new Set([...(prev.path === pathname ? prev.ids : []), ...newly]) }));
      },
      { threshold: 0.12 },
    );
    const centre = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    // Wait a frame so the new page's sections are in the DOM.
    const t = requestAnimationFrame(() => {
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) {
          enter.observe(el);
          centre.observe(el);
        }
      }
    });
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(t);
      ro.disconnect();
      enter.disconnect();
      centre.disconnect();
    };
  }, [pathname]);

  if (!pageSections.length) return null;

  return (
    <nav aria-label="On this page" className="fixed bottom-6 left-5 top-24 z-40 hidden w-6 md:block">
      <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-line" />
      <div
        ref={fillRef}
        className="absolute bottom-0 left-1/2 top-0 w-[2px] origin-top -translate-x-1/2 bg-signal shadow-[0_0_10px_rgb(61_245_196/0.8)]"
        style={{ transform: "scaleY(0)" }}
      />
      <div
        ref={headRef}
        aria-hidden
        className="absolute left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal shadow-[0_0_12px_4px_rgb(61_245_196/0.6)]"
        style={{ top: 0 }}
      />
      <ul>
        {pageSections.map((s, i) => {
          const on = litIds.has(s.id);
          const isActive = active === s.id;
          const top = positions[s.id] ?? (i + 1) / (pageSections.length + 1);
          return (
            <li key={s.id} className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: `${top * 100}%` }}>
              <a
                href={`#${s.id}`}
                aria-label={s.label}
                aria-current={isActive ? "location" : undefined}
                className="group relative flex h-5 w-5 items-center justify-center rounded-full"
              >
                <span
                  className={`block h-3 w-3 rounded-full border transition-all duration-500 ${
                    on ? "border-signal bg-signal shadow-[0_0_14px_3px_rgb(61_245_196/0.55)]" : "border-muted/60 bg-board"
                  } ${isActive ? "scale-125" : ""}`}
                />
                <span className="pointer-events-none absolute left-7 whitespace-nowrap rounded border border-line bg-surface px-2 py-1 font-mono text-[11px] text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="text-warm">~/</span>{s.label.toLowerCase()}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
