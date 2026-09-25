"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { experience, experienceLabels } from "@/content";
import SectionHeading from "@/components/ui/SectionHeading";
import Chip from "@/components/ui/Chip";
import { useReducedMotion } from "@/lib/hooks";

export default function Experience() {
  const [open, setOpen] = useState<number | null>(0);
  const reduced = useReducedMotion();

  return (
    <section id="experience" aria-labelledby="experience-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 md:py-32 md:pl-20">
      <SectionHeading id="experience" />
      <ol className="relative space-y-6 border-l border-line pl-6 md:pl-10">
        {experience.map((role, i) => {
          const isOpen = open === i;
          const panelId = `role-panel-${i}`;
          return (
            <li key={role.org + role.title} className="relative">
              <span
                aria-hidden
                className={`absolute -left-[31px] top-6 h-3 w-3 rotate-45 border transition-colors md:-left-[47px] ${
                  isOpen ? "border-signal bg-signal shadow-[0_0_12px_#3DF5C4]" : "border-warm bg-board"
                }`}
              />
              <div className={`rounded-xl border bg-surface transition-colors ${isOpen ? "border-signal/40" : "border-line hover:border-warm/50"}`}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full flex-col gap-3 rounded-xl p-5 text-left md:flex-row md:items-start md:justify-between md:p-6"
                  >
                    <span>
                      <span className="block font-display text-xl font-semibold text-ink">
                        {role.title}
                        <span className="text-warm"> · {role.org}</span>
                      </span>
                      <span className="mt-1 block font-mono text-xs text-muted">
                        {role.period} · {role.location}
                        {role.kind === "leadership" && <span className="ml-2 text-warm">[{experienceLabels.leadership}]</span>}
                      </span>
                    </span>
                    <span className="label-mono flex shrink-0 items-center gap-2 text-[11px] text-muted">
                      {isOpen ? experienceLabels.collapse : experienceLabels.expand}
                      <span aria-hidden className={`inline-block transition-transform ${isOpen ? "rotate-45 text-signal" : ""}`}>
                        +
                      </span>
                    </span>
                  </button>
                </h3>
                <div className="flex flex-wrap gap-1.5 px-5 pb-5 md:px-6">
                  {role.stack.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduced ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <ul className="space-y-2.5 border-t border-line px-5 py-5 text-ink/85 md:px-6">
                        {role.bullets.map((b) => (
                          <li key={b} className="flex gap-3">
                            <span aria-hidden className="mt-2.5 h-1 w-3 shrink-0 bg-warm" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
