"use client";

import { useMemo, useState } from "react";
import { projectCategories, skillGroups, skillLabels } from "@/content";
import { buildSkillGraph, GRAPH_H, GRAPH_W } from "@/lib/skillGraph";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Skills() {
  const graph = useMemo(() => buildSkillGraph(), []);
  const [focus, setFocus] = useState<string | null>(null);

  const neighbours = useMemo(() => {
    if (!focus) return null;
    const set = new Set([focus]);
    for (const l of graph.links) {
      if (l.source === focus) set.add(l.target);
      if (l.target === focus) set.add(l.source);
    }
    return set;
  }, [focus, graph.links]);

  const linkedSkills = useMemo(() => new Set(graph.nodes.filter((n) => n.kind === "skill").map((n) => n.id)), [graph.nodes]);
  const byId = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph.nodes]);
  const color = (cat?: string) => projectCategories.find((c) => c.id === cat)?.color ?? "#E6EDE9";

  const describe = (id: string) => {
    const n = byId.get(id)!;
    const others = graph.links
      .filter((l) => l.source === id || l.target === id)
      .map((l) => byId.get(l.source === id ? l.target : l.source)!.label);
    return `${n.label}: ${others.join(", ")}`;
  };

  return (
    <section id="skills" aria-labelledby="skills-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 md:py-32 md:pl-20">
      <SectionHeading id="skills" />

      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((g) => (
          <div key={g.label}>
            <h3 className="label-mono mb-3 text-[11px] text-warm">{g.label}</h3>
            <ul className="flex flex-wrap gap-2">
              {g.skills.map((s) => {
                const id = `s:${s.name}`;
                const interactive = linkedSkills.has(id);
                const on = neighbours?.has(id);
                return (
                  <li key={s.name}>
                    <span
                      onPointerEnter={interactive ? () => setFocus(id) : undefined}
                      onPointerLeave={interactive ? () => setFocus(null) : undefined}
                      className={`inline-flex rounded-md border px-2.5 py-1 font-mono text-xs transition-colors ${
                        on ? "border-signal bg-signal/10 text-signal" : "border-line bg-surface text-ink/85"
                      }`}
                    >
                      {s.name}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <figure className="mt-16 hidden md:block">
        <figcaption className="mb-3 flex items-baseline justify-between gap-4">
          <span className="label-mono text-[11px] text-ink">{skillLabels.graphTitle}</span>
          <span className="font-mono text-[11px] text-muted">{skillLabels.graphHint}</span>
        </figcaption>
        <div className="overflow-hidden rounded-xl border border-line bg-surface/60">
          <svg viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`} className="h-auto w-full" role="group" aria-label={skillLabels.graphTitle}>
            <g aria-hidden>
              {graph.links.map((l) => {
                const a = byId.get(l.source)!;
                const b = byId.get(l.target)!;
                const on = neighbours ? neighbours.has(l.source) && neighbours.has(l.target) : false;
                return (
                  <line
                    key={l.source + l.target}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={on ? color(b.category) : "#22302a"}
                    strokeWidth={on ? 1.6 : 1}
                    strokeOpacity={neighbours && !on ? 0.35 : 1}
                    className="transition-[stroke,stroke-opacity] duration-200"
                  />
                );
              })}
            </g>
            {graph.nodes.map((n) => {
              const dim = neighbours && !neighbours.has(n.id);
              const on = neighbours?.has(n.id);
              const isProject = n.kind === "project";
              const c = isProject ? color(n.category) : "#E6EDE9";
              return (
                <g
                  key={n.id}
                  tabIndex={0}
                  role="img"
                  aria-label={describe(n.id)}
                  transform={`translate(${n.x} ${n.y})`}
                  onPointerEnter={() => setFocus(n.id)}
                  onPointerLeave={() => setFocus(null)}
                  onFocus={() => setFocus(n.id)}
                  onBlur={() => setFocus(null)}
                  className="cursor-default outline-none transition-opacity duration-200 focus-visible:[&>circle]:stroke-signal"
                  style={{ opacity: dim ? 0.25 : 1 }}
                  data-cursor
                >
                  {isProject ? (
                    <rect x={-7} y={-7} width={14} height={14} rx={2} fill="#0A0F0D" stroke={c} strokeWidth={on ? 2.5 : 1.5} />
                  ) : (
                    <circle r={on ? 6 : 4.5} fill={on ? "#3DF5C4" : "#0A0F0D"} stroke={on ? "#3DF5C4" : "#8A9A93"} strokeWidth={1.5} />
                  )}
                  <text
                    y={isProject ? 22 : -11}
                    textAnchor="middle"
                    className="font-mono"
                    fontSize={isProject ? 12 : 11}
                    fill={isProject ? c : on ? "#3DF5C4" : "#8A9A93"}
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </figure>
    </section>
  );
}
