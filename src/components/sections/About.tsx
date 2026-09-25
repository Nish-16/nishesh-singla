"use client";

import { about as aboutLabels } from "@/content";
import { useSiteContent } from "@/components/SiteContentProvider";
import SectionHeading from "@/components/ui/SectionHeading";
import CountUp from "@/components/ui/CountUp";
import Chip from "@/components/ui/Chip";

export default function About() {
  const { about, identity } = useSiteContent();
  return (
    <section id="about" aria-labelledby="about-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 md:py-32 md:pl-20">
      <SectionHeading id="about" />
      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div className="flex flex-col gap-10">
          <div className="space-y-5 text-lg leading-relaxed text-ink/85">
            {about.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="label-mono text-[11px] text-second">{aboutLabels.educationLabels.title}</p>
            <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-ink">{about.education.school}</h3>
            <p className="mt-1 text-sm text-ink/80">{about.education.degree}</p>
            <p className="mt-1 font-mono text-xs text-muted">
              {about.education.dates} · {about.education.location}
            </p>
            {about.education.coursework.length > 0 && (
              <>
                <p className="mt-4 text-xs text-muted">{aboutLabels.educationLabels.coursework}</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {about.education.coursework.map((c) => (
                    <li key={c}>
                      <Chip>{c}</Chip>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* profile.json card */}
        <aside aria-label={aboutLabels.profileFile} className="self-start overflow-hidden rounded-xl border border-line bg-surface font-mono text-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-2 border-b border-line bg-surface-2/60 px-4 py-2.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-second/80" />
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-muted/50" />
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-accent/80" />
            <span className="ml-2 text-xs text-muted">{aboutLabels.profileFile}</span>
          </div>
          <div className="px-5 py-4 leading-7">
            <span aria-hidden className="text-muted">{"{"}</span>
            <dl className="pl-5">
              <Row k="name">
                <span className="text-second">&quot;{identity.name}&quot;</span>
              </Row>
              <Row k="role">
                <span className="text-second">&quot;{about.profileRole}&quot;</span>
              </Row>
              {about.stats.map((s) => (
                <Row key={s.key} k={s.key} note={s.note}>
                  <span className="text-accent">
                    <CountUp value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} />
                  </span>
                </Row>
              ))}
              <Row k="location" last>
                <span className="text-second">&quot;{identity.location}&quot;</span>
              </Row>
            </dl>
            <span aria-hidden className="text-muted">{"}"}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Row({ k, note, last, children }: { k: string; note?: string; last?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <dt className="text-ink/90">
        <span aria-hidden>&quot;</span>
        {k}
        <span aria-hidden>&quot;:</span>
      </dt>
      <dd>
        {children}
        {!last && (
          <span aria-hidden className="text-muted">
            ,
          </span>
        )}
        {note && <span className="ml-2 text-xs text-muted">{`// ${note}`}</span>}
      </dd>
    </div>
  );
}
