"use client";

import { useEffect, useRef, useState } from "react";
import { sections } from "@/content";

/**
 * Fixed rail down the left edge: fills with scroll progress, with a node per section.
 * A node lights up (and stays lit) once its section enters the viewport.
 */
export default function ScrollRail() {
  const fillRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<number[]>(() => sections.map((_, i) => (i + 1) / (sections.length + 1)));
  const [lit, setLit] = useState<Set<string>>(() => new Set());
  const [active, setActive] = useState<string | null>(null);

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
  }, []);

  // Node positions: where the fill is when the section reaches mid-viewport.
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      setPositions(
        sections.map(({ id }) => {
          const el = document.getElementById(id);
          if (!el) return 0;
          const top = el.getBoundingClientRect().top + window.scrollY;
          return Math.min(0.97, Math.max(0.03, (top - window.innerHeight * 0.5) / max));
        }),
      );
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  // Light nodes as sections enter the viewport.
  useEffect(() => {
    const els = sections.map(({ id }) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const enter = new IntersectionObserver(
      (entries) => {
        const newly = entries.filter((e) => e.isIntersecting).map((e) => e.target.id);
        if (newly.length) setLit((prev) => new Set([...prev, ...newly]));
      },
      { threshold: 0.12 },
    );
    const centre = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => {
      enter.observe(el);
      centre.observe(el);
    });
    return () => {
      enter.disconnect();
      centre.disconnect();
    };
  }, []);

  return (
    <nav aria-label="Sections" className="fixed bottom-6 left-5 top-24 z-40 hidden w-6 md:block">
      <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-line" />
      <div
        ref={fillRef}
        className="absolute bottom-0 left-1/2 top-0 w-[2px] origin-top -translate-x-1/2 bg-accent"
        style={{ transform: "scaleY(0)" }}
      />
      <div
        ref={headRef}
        aria-hidden
        className="absolute left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
        style={{ top: 0 }}
      />
      <ul>
        {sections.map((s, i) => {
          const on = lit.has(s.id);
          const isActive = active === s.id;
          return (
            <li key={s.id} className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: `${positions[i] * 100}%` }}>
              <a
                href={`#${s.id}`}
                aria-label={s.label}
                aria-current={isActive ? "location" : undefined}
                className="group relative flex h-5 w-5 items-center justify-center rounded-full"
              >
                <span
                  className={`block h-3 w-3 rounded-full border transition-all duration-500 ${
                    on ? "border-accent bg-accent" : "border-muted/60 bg-canvas"
                  } ${isActive ? "scale-125" : ""}`}
                />
                <span className="pointer-events-none absolute left-7 whitespace-nowrap rounded border border-line bg-surface px-2 py-1 font-mono text-[11px] text-ink opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="text-second">~/</span>
                  {s.label.toLowerCase()}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
