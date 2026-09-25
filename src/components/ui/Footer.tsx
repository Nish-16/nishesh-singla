import { contact, footer, identity, sections } from "@/content";

export default function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 md:pl-20">
      <div className="flex flex-col gap-4 border-t border-line pt-6 font-mono text-xs text-muted md:flex-row md:items-center md:justify-between">
        <p>{footer.text}</p>
        <ul className="flex flex-wrap gap-4">
          {sections
            .filter((s) => s.nav)
            .map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="hover:text-ink">
                  {s.label}
                </a>
              </li>
            ))}
          <li>
            <a href={identity.github} target="_blank" rel="noreferrer" className="hover:text-ink">
              {contact.labels.github} ↗
            </a>
          </li>
          <li>
            <a href={identity.linkedin} target="_blank" rel="noreferrer" className="hover:text-ink">
              {contact.labels.linkedin} ↗
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
