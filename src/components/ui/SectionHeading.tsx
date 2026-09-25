"use client";

import { sections, type SectionId } from "@/content";
import { useSiteContent } from "@/components/SiteContentProvider";
import ScrambleText from "./ScrambleText";

/** Code-style section label, e.g. `~/projects`. */
export default function SectionHeading({ id }: { id: SectionId }) {
  const { sectionIntros } = useSiteContent();
  const s = sections.find((x) => x.id === id)!;
  return (
    <header className="mb-10 md:mb-14">
      <h2 id={`${id}-title`} className="flex flex-wrap items-baseline gap-x-3 font-mono text-sm text-ink md:text-base">
        <span>
          <span aria-hidden className="text-muted">
            ~/
          </span>
          <ScrambleText text={s.label.toLowerCase()} />
        </span>
      </h2>
      <p className="mt-4 max-w-2xl font-display text-3xl font-medium leading-tight text-ink md:text-4xl">{sectionIntros[id]}</p>
    </header>
  );
}
