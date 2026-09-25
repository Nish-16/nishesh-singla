import Link from "next/link";
import { featuredLabels, projects } from "@/content";
import SectionHeading from "@/components/ui/SectionHeading";
import ProjectCard from "./ProjectCard";

export default function FeaturedWork() {
  const featured = projects.filter((p) => p.featured);
  return (
    <section id="featured" aria-labelledby="featured-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 md:py-32 md:pl-20">
      <SectionHeading id="featured" />
      <ul className="grid gap-5 md:grid-cols-2">
        {featured.map((p) => (
          <li key={p.slug}>
            <ProjectCard project={p} href={`/work#project-${p.slug}`} />
          </li>
        ))}
      </ul>
      <Link
        href="/work#projects"
        className="mt-8 inline-flex items-center gap-2 rounded-md border border-line px-4 py-2.5 font-mono text-sm text-ink transition-colors hover:border-signal/60 hover:text-signal"
      >
        {featuredLabels.viewAll} <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
