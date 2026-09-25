"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { projectCategories, projectLabels, type Project, type ProjectCategory } from "@/content";
import { useSiteContent } from "@/components/SiteContentProvider";
import SectionHeading from "@/components/ui/SectionHeading";
import Chip from "@/components/ui/Chip";
import Modal from "@/components/ui/Modal";
import SensorReadout from "./SensorReadout";
import ProjectCard, { category } from "./ProjectCard";
import { useReducedMotion } from "@/lib/hooks";

const XplorRoom = dynamic(() => import("@/components/three/XplorRoom"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center font-mono text-xs text-muted">loading scene…</div>,
});

type Filter = "all" | ProjectCategory;
const HASH_PREFIX = "#project-";

function slugFromHash(projects: Project[]): string | null {
  if (typeof window === "undefined") return null;
  const h = window.location.hash;
  if (!h.startsWith(HASH_PREFIX)) return null;
  const slug = h.slice(HASH_PREFIX.length);
  return projects.some((p) => p.slug === slug) ? slug : null;
}

export default function Projects() {
  const { projects } = useSiteContent();
  const [filter, setFilter] = useState<Filter>("all");
  // Deep link: /#project-<slug> opens that project's modal.
  const [openSlug, setOpenSlug] = useState<string | null>(() => slugFromHash(projects));
  const reduced = useReducedMotion();

  useEffect(() => {
    const onHash = () => {
      const slug = slugFromHash(projects);
      if (slug) setOpenSlug(slug);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [projects]);

  const close = () => {
    setOpenSlug(null);
    if (window.location.hash.startsWith(HASH_PREFIX)) history.replaceState(null, "", window.location.pathname);
  };

  const visible = useMemo(() => (filter === "all" ? projects : projects.filter((p) => p.category === filter)), [filter, projects]);
  const openProject = projects.find((p) => p.slug === openSlug) ?? null;

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: projectLabels.all, count: projects.length },
    ...projectCategories
      .map((c) => ({ id: c.id, label: c.label, count: projects.filter((p) => p.category === c.id).length }))
      .filter((c) => c.count > 0),
  ];

  return (
    <section id="projects" aria-labelledby="projects-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 md:py-32 md:pl-20">
      <SectionHeading id="projects" />

      <div role="group" aria-label="Filter projects" className="mb-8 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.id)}
              className={`relative rounded-md border px-3.5 py-2 font-mono text-xs transition-colors ${
                active ? "border-ink text-canvas" : "border-line text-muted hover:border-second/60 hover:text-ink"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 -z-0 rounded-[5px] bg-ink"
                  transition={{ duration: reduced ? 0 : 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                />
              )}
              <span className="relative">
                {f.label} <span className={active ? "text-canvas/70" : "text-muted/70"}>({f.count})</span>
              </span>
            </button>
          );
        })}
      </div>

      <LayoutGroup>
        <motion.ul layout={!reduced} className="grid grid-flow-dense grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((p) => (
              <motion.li
                key={p.slug}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                className={p.featured ? "sm:col-span-2" : ""}
              >
                <ProjectCard project={p} onOpen={() => setOpenSlug(p.slug)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </LayoutGroup>

      <Modal open={!!openProject} onClose={close} labelledBy="project-modal-title">
        {openProject && <ProjectDetail project={openProject} onClose={close} />}
      </Modal>
    </section>
  );
}

function ProjectDetail({ project: p, onClose }: { project: Project; onClose: () => void }) {
  const cat = category(p.category);
  const links: { label: string; href: string | null }[] = [
    { label: projectLabels.github, href: p.links.github },
    { label: projectLabels.live, href: p.links.live },
  ];
  return (
    <article>
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface/95 px-6 py-5 backdrop-blur">
        <div>
          <p className="font-mono text-[11px]" style={{ color: cat.color }}>
            {cat.label} · {p.date}
          </p>
          <h3 id="project-modal-title" className="mt-1 font-display text-2xl font-semibold text-ink md:text-3xl">
            {p.title}
          </h3>
          {p.status && <p className="mt-1 font-mono text-xs text-second">{p.status}</p>}
          {p.context && <p className="mt-1 text-sm text-muted">{p.context}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          data-autofocus
          aria-label={projectLabels.close}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line font-mono text-muted transition-colors hover:border-accent/60 hover:text-ink"
        >
          ✕
        </button>
      </div>

      <div className="space-y-8 px-6 py-6">
        {p.demo === "xplor-room" && (
          <figure>
            <div className="h-64 overflow-hidden rounded-lg border border-line md:h-80">
              <XplorRoom />
            </div>
            <figcaption className="mt-2 font-mono text-[11px] text-muted">{projectLabels.demoCaption}</figcaption>
          </figure>
        )}

        {p.problem.trim() && (
          <DetailBlock label={projectLabels.problem}>
            <p className="text-ink/85">{p.problem}</p>
          </DetailBlock>
        )}

        {p.built.some((b) => b.trim()) && (
          <DetailBlock label={projectLabels.built}>
            <ul className="space-y-2 text-ink/85">
              {p.built
                .filter((b) => b.trim())
                .map((b) => (
                  <li key={b} className="flex gap-3">
                    <span aria-hidden className="mt-2.5 h-1 w-3 shrink-0" style={{ background: cat.color }} />
                    <span>{b}</span>
                  </li>
                ))}
            </ul>
          </DetailBlock>
        )}

        {p.metrics.length > 0 && (
          <DetailBlock label={projectLabels.numbers}>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {p.metrics.map((m) => (
                <div key={m.label} className="flex flex-col-reverse rounded-lg border border-line bg-canvas/60 p-3">
                  <dt className="mt-1 text-xs text-muted">{m.label}</dt>
                  <dd className="font-mono text-xl font-semibold" style={{ color: cat.color }}>
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
          </DetailBlock>
        )}

        {p.readout && <SensorReadout fields={p.readout} simLabel={projectLabels.simulated} />}

        {p.stack.length > 0 && (
          <DetailBlock label={projectLabels.stack}>
            <div className="flex flex-wrap gap-1.5">
              {p.stack.map((t) => (
                <Chip key={t} tone={p.category === "iot" ? "second" : "accent"}>
                  {t}
                </Chip>
              ))}
            </div>
          </DetailBlock>
        )}

        <div className="flex flex-wrap gap-3 border-t border-line pt-6">
          {links.map((l) =>
            l.href ? (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-accent/60 px-4 py-2 font-mono text-sm text-accent transition-colors hover:bg-accent/10"
              >
                {l.label} ↗
              </a>
            ) : (
              // TODO: link placeholder — fill in content.ts
              <span key={l.label} className="rounded-md border border-dashed border-line px-4 py-2 font-mono text-sm text-muted">
                {l.label} — {projectLabels.linkTodo}
              </span>
            ),
          )}
        </div>
      </div>
    </article>
  );
}

function DetailBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="label-mono mb-3 text-[11px] text-second">{label}</h4>
      {children}
    </section>
  );
}
