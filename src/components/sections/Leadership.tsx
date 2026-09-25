"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import Chip from "@/components/ui/Chip";
import { useSiteContent } from "@/components/SiteContentProvider";

/** Roles marked "leadership" in Experience (edited in the admin's Experience tab). */
export default function Leadership() {
  const roles = useSiteContent().experience.filter((r) => r.kind === "leadership");
  if (!roles.length) return null;

  return (
    <section id="leadership" aria-labelledby="leadership-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 md:py-32 md:pl-20">
      <SectionHeading id="leadership" />
      <ul className="grid gap-5 md:grid-cols-2">
        {roles.map((r) => (
          <li key={r.org + r.period} className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-6">
            <div>
              <h3 className="font-display text-lg font-semibold leading-snug text-ink">{r.org}</h3>
              <p className="mt-1 font-mono text-xs text-muted">
                {r.title} · {r.period}
              </p>
            </div>
            <ul className="flex flex-col gap-2 text-sm text-ink/85">
              {r.bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <span aria-hidden className="mt-2 h-1 w-3 shrink-0 bg-second" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            {r.stack.length > 0 && (
              <div className="mt-auto flex flex-wrap gap-1.5">
                {r.stack.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
