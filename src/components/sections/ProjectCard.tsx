import Link from "next/link";
import { projectCategories, projectLabels, type Project, type ProjectCategory } from "@/content";
import TiltCard from "@/components/ui/TiltCard";
import Chip from "@/components/ui/Chip";

export const category = (id: ProjectCategory) => projectCategories.find((c) => c.id === id)!;

const CARD = "relative flex h-full w-full flex-col gap-4 rounded-xl p-5 text-left md:p-6";

/** Project card: opens the detail modal (`onOpen`) or links to it (`href`). */
export default function ProjectCard({ project: p, onOpen, href }: { project: Project; onOpen?: () => void; href?: string }) {
  const cat = category(p.category);
  const lead = p.metrics[0];
  const maxChips = p.featured ? 6 : 4;
  const label = `${p.title} — ${projectLabels.open}`;

  const content = (
    <>
      <div className="flex items-center justify-between gap-3 font-mono text-[11px]">
        <span className="flex items-center gap-2" style={{ color: cat.color }}>
          <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: cat.color, boxShadow: `0 0 8px ${cat.color}` }} />
          {cat.label}
          {p.featured && <span className="text-muted">· {projectLabels.featured}</span>}
        </span>
        <span className="text-muted">{p.date}</span>
      </div>

      <div>
        <h3 className={`font-display font-semibold leading-snug text-ink ${p.featured ? "text-2xl md:text-3xl" : "text-xl"}`}>{p.title}</h3>
        {p.status && <p className="mt-1 font-mono text-[11px] text-warm">{p.status}</p>}
        <p className="mt-2 text-sm leading-relaxed text-ink/75">{p.summary}</p>
      </div>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
        <div className="flex flex-wrap gap-1.5">
          {p.stack.slice(0, maxChips).map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
          {p.stack.length > maxChips && <Chip>+{p.stack.length - maxChips}</Chip>}
        </div>
        {lead && (
          <p className="text-right font-mono">
            <span className="block text-lg font-semibold" style={{ color: cat.color }}>
              {lead.value}
            </span>
            <span className="block text-[10px] text-muted">{lead.label}</span>
          </p>
        )}
      </div>
    </>
  );

  return (
    <TiltCard glow={cat.color}>
      {href ? (
        <Link href={href} aria-label={label} className={CARD}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onOpen} aria-haspopup="dialog" aria-label={label} className={CARD}>
          {content}
        </button>
      )}
    </TiltCard>
  );
}
