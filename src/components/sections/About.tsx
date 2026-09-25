import { about, identity } from "@/content";
import SectionHeading from "@/components/ui/SectionHeading";
import CountUp from "@/components/ui/CountUp";

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 md:py-32 md:pl-20">
      <SectionHeading id="about" />
      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div className="space-y-5 text-lg leading-relaxed text-ink/85">
          {about.bio.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        {/* profile.json card */}
        <aside aria-label={about.profileFile} className="overflow-hidden rounded-xl border border-line bg-surface font-mono text-sm">
          <div className="flex items-center gap-2 border-b border-line bg-surface-2/60 px-4 py-2.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-warm/80" />
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-muted/50" />
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-signal/80" />
            <span className="ml-2 text-xs text-muted">{about.profileFile}</span>
          </div>
          <div className="px-5 py-4 leading-7">
            <span aria-hidden className="text-muted">{"{"}</span>
            <dl className="pl-5">
              <Row k="name">
                <span className="text-warm-bright">&quot;{identity.name}&quot;</span>
              </Row>
              <Row k="role">
                <span className="text-warm-bright">&quot;{about.profileRole}&quot;</span>
              </Row>
              {about.stats.map((s) => (
                <Row key={s.key} k={s.key} note={s.note}>
                  <span className="text-signal">
                    <CountUp value={s.value} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} />
                  </span>
                </Row>
              ))}
              <Row k="location" last>
                <span className="text-warm-bright">&quot;{identity.location}&quot;</span>
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
