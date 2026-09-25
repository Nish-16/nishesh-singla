import ScrambleText from "./ScrambleText";

/** Top-of-page header for inner pages: `~/work` path, H1, and intro. */
export default function PageHeader({ path, title, heading, intro }: { path: string; title: string; heading: string; intro: string }) {
  return (
    <header className="mx-auto max-w-6xl px-4 pb-4 pt-32 sm:px-6 md:pl-20 md:pt-40">
      <p className="font-mono text-sm text-muted">
        <span className="text-signal">$</span> cd <ScrambleText text={`~/${path}`} />
      </p>
      <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-ink md:text-7xl">{title}</h1>
      <p className="mt-5 max-w-3xl font-display text-2xl leading-snug text-ink/85 md:text-3xl">{heading}</p>
      <p className="mt-4 max-w-2xl text-muted">{intro}</p>
    </header>
  );
}
