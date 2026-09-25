import { achievements } from "@/content";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Research() {
  return (
    <section id="research" aria-labelledby="research-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 md:py-32 md:pl-20">
      <SectionHeading id="research" />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a) => (
          <li key={a.title} className="relative overflow-hidden rounded-xl border border-line bg-surface p-6 transition-colors hover:border-second/60">
            <span aria-hidden className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-second" />
            <span aria-hidden className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-second" />
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="label-mono text-second">{a.kind}</span>
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold leading-snug text-ink">{a.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{a.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
